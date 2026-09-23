#!/usr/bin/env node
/**
 * Captura una sección de la página a un ancho exacto, para compararla contra Figma.
 *
 * Habla con Chrome por el protocolo de DevTools, así que no depende ni de
 * `--virtual-time-budget` (que a veces deja la página sin hidratar) ni de iframes.
 * No instala nada: usa el Chrome de la máquina y el `ws` que Next trae compilado.
 *
 * Uso:
 *   node scripts/captura.js --ancla quienes-somos --w 390 --h 1240 --out /tmp/q.png
 *   node scripts/captura.js --ancla intro-paso-2-desktop --w 1280 --h 832 --lang fr
 *   node scripts/captura.js --ancla quienes-somos --w 390 --h 1240 --y 1240   (segundo tramo)
 *
 * Opciones: --url (por defecto http://localhost:3000), --lang (es|en|fr), --y (px extra
 * de desplazamiento desde el ancla), --espera (ms tras cargar, por defecto 3000), --tras (ms
 * entre desplazarse al ancla y capturar, por defecto 1200; súbelo para ver el final de una
 * animación que arranca al entrar en viewport).
 *
 * Para la Introducción con pin (docs/introduccion/DECISIONES.md, D2) solo están montadas la
 * parte actual y, durante una transición, la saliente. Por eso hay flags propios:
 *
 *   --paso N         agrega `?introPaso=N`: fuerza la parte (1, 2 o 3) y engancha el pin de
 *                    inmediato, sin animar la entrada. Reemplaza a --ancla para la intro.
 *   --gesto dY       dispara UN evento real de wheel por CDP con ese deltaY (positivo avanza).
 *   --rafaga N:dY    N eventos de wheel seguidos, 16 ms entre cada uno.
 *   --inercia A:r    simula el trackpad: 60 eventos cada 30 ms (1,8 s) empezando en deltaY A y
 *                    decayendo por el factor r en cada evento. Por defecto 120:0.9 (unos 1200 px
 *                    en total, un gesto normal). Con A negativo retrocede.
 *   --tecla K        dispara keydown/keyup reales de la tecla K (Tab, Escape, ArrowDown...).
 *   --tras-lista L   en vez de una sola captura tras el gesto, una por cada ms de la lista
 *                    (por ejemplo 0,300,600,900,1200), contados desde que TERMINA el gesto. Los
 *                    archivos salen con el sufijo `-<ms>` antes de `.png`.
 *   --recorte id     recorta la captura a la caja del elemento con ese id (sirve para comparar
 *                    una parte aunque cambie su posición vertical en la pantalla). También acepta
 *                    un selector CSS, por ejemplo `#intro-paso-3 [data-rol=barco]` para un zoom.
 *   --reducido       emula `prefers-reduced-motion: reduce`.
 *   --hash h         carga la página con `#h` en la URL.
 *   --leer expr      evalúa `expr` en la página al final e imprime el resultado en JSON.
 *   --quieto         agrega `?quieto=1`: congela el movimiento en reposo de la intro, para que
 *                    las capturas en reposo se puedan comparar píxel a píxel.
 *   --param k=v      añade un parámetro más a la URL.
 *
 * Ejemplos:
 *   node scripts/captura.js --paso 2 --w 1280 --h 832 --out /tmp/paso2.png
 *   node scripts/captura.js --inercia 120:0.9 --tras 2500 --leer "document.querySelector('[data-paso]').dataset.paso"
 *   node scripts/captura.js --gesto 120 --tras-lista 0,300,600,900,1200 --out /tmp/t12.png
 */
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('next/dist/compiled/ws');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .join(' ')
    .split(/\s--/)
    .filter(Boolean)
    .map(s => {
      const [k, ...v] = s.replace(/^--/, '').split(' ');
      return [k, v.join(' ')];
    })
);
const url = args.url || 'http://localhost:3000';
const lang = args.lang && args.lang !== 'es' ? `/${args.lang}` : '';
const w = Number(args.w || 390);
const h = Number(args.h || 700);
const y = Number(args.y || 0);
const espera = Number(args.espera || 3000);
const tras = Number(args.tras || 1200);
const out = args.out || `/tmp/captura-${args.ancla || args.paso || 'home'}-${w}.png`;
const params = [
  args.paso && `introPaso=${encodeURIComponent(args.paso)}`,
  'quieto' in args && 'quieto=1',
  args.param,
].filter(Boolean);
const query = params.length ? `?${params.join('&')}` : '';
const hash = args.hash ? `#${args.hash}` : '';

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--remote-debugging-port=0',
  'about:blank',
]);
const dormir = ms => new Promise(r => setTimeout(r, ms));

chrome.stderr.on('data', async chunk => {
  const m = /DevTools listening on (ws:\S+)/.exec(chunk.toString());
  if (!m) return;
  try {
    await capturar(m[1]);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    chrome.kill();
  }
});

async function capturar(browserWs) {
  const ws = new WebSocket(browserWs);
  await new Promise(r => ws.once('open', r));
  let id = 0;
  const pendientes = new Map();
  const eventos = [];
  ws.on('message', raw => {
    const msg = JSON.parse(raw);
    if (msg.id && pendientes.has(msg.id)) {
      pendientes.get(msg.id)(msg);
      pendientes.delete(msg.id);
    } else if (msg.method) {
      eventos.push(msg);
    }
  });
  const enviar = (method, params = {}, sessionId) =>
    new Promise(resolve => {
      const msgId = ++id;
      pendientes.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
    });

  const { result: target } = await enviar('Target.createTarget', { url: 'about:blank' });
  const { result: attach } = await enviar('Target.attachToTarget', {
    targetId: target.targetId,
    flatten: true,
  });
  const s = attach.sessionId;
  await enviar('Page.enable', {}, s);
  await enviar(
    'Emulation.setDeviceMetricsOverride',
    { width: w, height: h, deviceScaleFactor: 1, mobile: false },
    s
  );
  if ('reducido' in args) {
    await enviar(
      'Emulation.setEmulatedMedia',
      { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
      s
    );
  }
  await enviar('Page.navigate', { url: `${url}${lang}${query}${hash}` }, s);
  // Espera al load y luego un rato más: las capas son imágenes y tardan en resolver su alto.
  for (let i = 0; i < 100 && !eventos.some(e => e.method === 'Page.loadEventFired'); i++)
    await dormir(200);
  await dormir(espera);
  if (args.ancla) {
    await enviar(
      'Runtime.evaluate',
      {
        expression: `(() => { const el = document.getElementById(${JSON.stringify(args.ancla)}); if (!el) return 'NO_EXISTE'; window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + ${y}); return 'ok'; })()`,
        returnByValue: true,
      },
      s
    ).then(({ result }) => {
      if (result?.result?.value !== 'ok') throw new Error(`Ancla no encontrada: ${args.ancla}`);
    });
    await dormir(tras);
  }

  // Gestos reales de wheel y teclado por CDP, para probar la transición en marcha y que un
  // gesto, dure lo que dure, solo avance una parte (docs/introduccion/DECISIONES.md, D2).
  const rueda = deltaY =>
    enviar(
      'Input.dispatchMouseEvent',
      { type: 'mouseWheel', x: Math.round(w / 2), y: Math.round(h / 2), deltaX: 0, deltaY },
      s
    );
  const hayGesto = args.gesto || args.rafaga || args.inercia || args.tecla;
  if (args.gesto) await rueda(Number(args.gesto));
  if (args.rafaga) {
    const [n, deltaY] = args.rafaga.split(':').map(Number);
    for (let i = 0; i < n; i++) {
      await rueda(deltaY);
      await dormir(16);
    }
  }
  if (args.inercia !== undefined) {
    const [inicio, factor] = (args.inercia || '120:0.9').split(':').map(Number);
    for (let i = 0; i < 60; i++) {
      const d = inicio * factor ** i;
      // El trackpad nunca manda menos de 1 px por evento mientras dura la inercia.
      await rueda(Math.sign(d) * Math.max(1, Math.round(Math.abs(d))));
      await dormir(30);
    }
  }
  if (args.tecla) {
    const params = {
      key: args.tecla,
      code: args.tecla,
      windowsVirtualKeyCode: CODIGOS[args.tecla],
    };
    await enviar('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...params }, s);
    await enviar('Input.dispatchKeyEvent', { type: 'keyUp', ...params }, s);
  }

  const leer = async () => {
    if (!args.leer) return;
    const { result } = await enviar(
      'Runtime.evaluate',
      { expression: args.leer, returnByValue: true },
      s
    );
    // eslint-disable-next-line no-console -- es la salida que se pidió con --leer
    console.log(JSON.stringify(result?.result?.value ?? result?.exceptionDetails ?? null));
  };

  const fotografiar = async destino => {
    let clip;
    if (args.recorte) {
      const { result } = await enviar(
        'Runtime.evaluate',
        {
          expression: `(() => { const r = (document.getElementById(${JSON.stringify(args.recorte)}) ?? document.querySelector(${JSON.stringify(args.recorte)}))?.getBoundingClientRect(); return r ? [r.left + scrollX, r.top + scrollY, r.width, r.height] : null; })()`,
          returnByValue: true,
        },
        s
      );
      const caja = result?.result?.value;
      if (!caja) throw new Error(`Recorte no encontrado: ${args.recorte}`);
      clip = { x: caja[0], y: caja[1], width: caja[2], height: caja[3], scale: 1 };
    }
    const { result: shot } = await enviar(
      'Page.captureScreenshot',
      {
        format: 'png',
        // Capturar fuera de la pantalla redimensiona la página un instante, y eso altera el pin
        // de la intro a mitad de una transición: solo se pide si el recorte no cabe.
        ...(clip && { clip, captureBeyondViewport: clip.y + clip.height > h || clip.y < 0 }),
      },
      s
    );
    fs.writeFileSync(destino, Buffer.from(shot.data, 'base64'));
    // eslint-disable-next-line no-console -- la ruta del PNG es la salida del script
    console.log(destino);
  };

  if (args['tras-lista']) {
    const lista = args['tras-lista'].split(',').map(Number);
    let transcurrido = 0;
    for (const ms of lista) {
      await dormir(ms - transcurrido);
      transcurrido = ms;
      await fotografiar(out.replace(/\.png$/, `-${ms}.png`));
    }
    await leer();
  } else {
    if (hayGesto) await dormir(tras);
    await leer();
    await fotografiar(out);
  }
  ws.close();
}

/** Códigos de tecla de Windows que pide CDP para que el navegador trate la tecla como real. */
const CODIGOS = {
  Tab: 9,
  Escape: 27,
  PageUp: 33,
  PageDown: 34,
  ArrowUp: 38,
  ArrowDown: 40,
  ' ': 32,
};
