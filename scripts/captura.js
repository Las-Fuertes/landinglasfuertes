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
 * de desplazamiento desde el ancla), --espera (ms tras cargar, por defecto 3000).
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
const out = args.out || `/tmp/captura-${args.ancla || 'home'}-${w}.png`;

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
  await enviar('Page.navigate', { url: `${url}${lang}` }, s);
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
    await dormir(1200);
  }
  const { result: shot } = await enviar('Page.captureScreenshot', { format: 'png' }, s);
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  // eslint-disable-next-line no-console -- la ruta del PNG es la salida del script
  console.log(out);
  ws.close();
}
