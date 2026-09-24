#!/usr/bin/env node
/**
 * Mide el resaltado (chip rasgado) en los 12 usos del sitio y los captura, para comprobar el
 * criterio de docs/resaltado/DECISIONES.md (D1) sin ir a ojo. Nació del medidor de la auditoría
 * (docs/resaltado/AUDITORIA.md, sección 3) y usa la misma mecánica que scripts/captura.js: el
 * Chrome de la máquina por el protocolo de DevTools y el `ws` que Next trae compilado.
 *
 * Uso (con `npm run dev` en :3000):
 *   node scripts/medir-resaltado.js --out /tmp/chip --prefijo despues
 *   node scripts/medir-resaltado.js --langs fr --anchos 390x844 --usos intro3,impacto-titulos
 *
 * Opciones: --url (http://localhost:3000), --langs (es,en,fr), --anchos (390x844,768x1024,
 * 1280x832,1512x982,1920x1080), --usos (todos por defecto), --out (carpeta de salida),
 * --prefijo (antecede al nombre de cada PNG: <prefijo>-<uso>-<lang>-<ancho>.png), --sin-fotos.
 *
 * Escribe <out>/<prefijo>-medidas.json y una tabla PASA / FALLA por uso, idioma y ancho.
 *
 * Qué mide, por cada pieza del fondo (una pieza = un tramo de fondo negro, rosa o de papel):
 * - lineas: en cuántas líneas visuales cae el texto de la pieza (tiene que ser 1).
 * - exceso: ancho del fondo menos ancho del texto (no más de 24 px: nada de fondo a todo ancho).
 * - palabraCorta: pieza de una sola palabra de 3 letras o menos cuando la frase tiene más.
 * - gapArriba / gapAbajo: separación en px entre el fondo y las líneas de texto vecinas, de
 *   cualquier párrafo o pieza de la sección. Negativo = el fondo pisa esa línea. Tolerancia 1 px.
 * - gapLado: lo mismo con las palabras de su propia línea (el aire lateral y el borde rasgado).
 * - gapFondo: separación con el fondo de otra pieza (tiras apiladas que no se funden).
 *
 * La geometría es la real: se quitan los giros de todas las piezas, se mide sin giro y se vuelve
 * a girar cada caja con su matriz y su `transform-origin`. El fondo es el `::before` de la pieza
 * (sus `inset` y su propio `transform` si lo tiene), ampliado por lo que derrama el filtro
 * rasgado: el desplazamiento del `feDisplacementMap` (escala / 2) limitado por la región del
 * filtro. El texto vecino se mide palabra a palabra con `Range.getClientRects` y, si está dentro
 * de otra pieza girada, con el giro de esa pieza. La separación se calcula punto a punto sobre
 * el tramo horizontal que comparten, no con cajas envolventes: dos tiras paralelas giradas no
 * cuentan como solapadas.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
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
const URL_BASE = args.url || 'http://localhost:3000';
const LANGS = (args.langs || 'es,en,fr').split(',');
const ANCHOS = (args.anchos || '390x844,768x1024,1280x832,1512x982,1920x1080')
  .split(',')
  .map(s => s.split('x').map(Number));
const OUT = args.out || '/tmp/medir-resaltado';
const PREFIJO = args.prefijo || 'medida';
const FOTOS = !('sin-fotos' in args);
const TOLERANCIA = 1;
const EXCESO_MAX = 24;
fs.mkdirSync(OUT, { recursive: true });
const dormir = ms => new Promise(r => setTimeout(r, ms));
// La salida del script es texto por consola (progreso y tabla), no un log de depuración.
const decir = texto => process.stdout.write(`${texto}\n`);

/*
 * Los 12 usos (docs/resaltado/AUDITORIA.md, sección 1). `raiz` es el contenedor contra cuyo
 * texto se mide la separación; `piezas` elige las piezas del uso dentro de la raíz.
 */
const PIEZAS =
  '.resaltado-pieza, .map-chip, .donation-title-chip, #donations-title > span:not([aria-hidden])';
const USOS = [
  { uso: 'intro1', carga: '?introPaso=1&quieto=1', raiz: '[id^="intro-paso-1"]', margen: 140 },
  { uso: 'intro3', carga: '?introPaso=3&quieto=1', raiz: '[id^="intro-paso-3"]', margen: 140 },
  {
    uso: 'emi-sello',
    raiz: '#emi',
    filtro: '["EMI", "CME"].includes(p.textContent.trim())',
    margen: 120,
  },
  { uso: 'emi-cinta', raiz: '#emi', filtro: '!!p.closest("#principios")', margen: 120 },
  { uso: 'donaciones', raiz: '#tripulantes', filtro: '!!p.closest("#donations-title")' },
  ...['1', '2', '3', '4'].map(n => ({
    uso: `impacto-titulo${n}`,
    raiz: '#impacto',
    filtro: `(() => { const h = [...document.querySelectorAll('#impacto .impacto-bloque h3')][${Number(n) - 1}]; return !!h && h.contains(p); })()`,
  })),
  {
    uso: 'impacto-cierre',
    raiz: '#impacto',
    filtro: '!!p.closest("h3") && !p.closest(".impacto-bloque")',
  },
  { uso: 'impacto-etiquetas', raiz: '#impacto', filtro: '!!p.closest(".impacto-etiqueta")' },
  { uso: 'quienes', raiz: '#quienes-somos' },
  ...[1, 2, 3, 4, 5].map(n => ({
    uso: `modal${n}`,
    modal: n,
    raiz: '[role=dialog]',
    filtro: '!!p.closest("h3")',
  })),
  {
    uso: 'sumate-proyecto',
    drawer: true,
    margen: 120,
    raiz: '[role=dialog]',
    filtro:
      'p.textContent.trim().length > 0 && !!p.closest("p") && p.closest("p").nextElementSibling?.tagName === "H3"',
  },
  {
    uso: 'sumate-llegue',
    drawer: true,
    margen: 120,
    antes: '[aria-controls="panel-cosas"]',
    raiz: '[role=dialog]',
    filtro:
      'p.textContent.trim().length > 0 && !!p.closest("p") && p.closest("p").nextElementSibling?.tagName === "H4"',
  },
].filter(u => !args.usos || args.usos.split(',').some(x => u.uso.startsWith(x)));

// Corre en la página. Devuelve una fila por pieza del uso.
const MEDIR = `
(function medir({ uso, raiz, filtro, piezasSel }) {
  const root = document.querySelector(raiz);
  if (!root) return [{ uso, error: 'no existe ' + raiz }];
  const opacidad = el => { let o = 1; for (let e = el; e && e !== document.documentElement; e = e.parentElement) o *= +getComputedStyle(e).opacity; return o; };
  const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && !(el.closest('[aria-hidden="true"]') && !el.closest(${JSON.stringify(PIEZAS)}) ) && opacidad(el) > 0.05;
  const todas = [...root.querySelectorAll(piezasSel)].filter(visible);
  let piezas = todas;
  if (filtro) { const f = new Function('p', 'return ' + filtro); piezas = piezas.filter(p => { try { return f(p); } catch { return false; } }); }
  const matriz = t => { if (!t || t === 'none') return [1, 0, 0, 1, 0, 0]; const v = t.match(/matrix\\(([^)]+)\\)/); return v ? v[1].split(',').map(Number) : [1, 0, 0, 1, 0, 0]; };
  const aplicar = (m, o, p) => { const x = p.x - o.x, y = p.y - o.y; return { x: o.x + m[0] * x + m[2] * y + m[4], y: o.y + m[1] * x + m[3] * y + m[5] }; };
  const grados = m => +(Math.atan2(m[1], m[0]) * 180 / Math.PI).toFixed(2);

  // 1. Guarda la matriz de cada pieza y la quita para medir sin giro.
  const info = new Map();
  todas.forEach(p => { const cs = getComputedStyle(p); info.set(p, { m: matriz(cs.transform), origen: cs.transformOrigin.split(' ').map(parseFloat), previo: p.style.getPropertyValue('transform'), prioridad: p.style.getPropertyPriority('transform') }); });
  todas.forEach(p => p.style.setProperty('transform', 'none', 'important'));

  const quad = (r, p) => {
    const esq = [{ x: r.l, y: r.t }, { x: r.r, y: r.t }, { x: r.r, y: r.b }, { x: r.l, y: r.b }];
    if (!p) return esq;
    const i = info.get(p), u = p.getBoundingClientRect();
    const o = { x: u.left + i.origen[0], y: u.top + i.origen[1] };
    return esq.map(q => aplicar(i.m, o, q));
  };

  // 2. Palabras de la sección, sin giro, y luego giradas con su pieza.
  const palabras = [];
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = tw.nextNode())) {
    const el = n.parentElement;
    if (!el || !n.data.trim() || !visible(el)) continue;
    const pieza = todas.find(p => p.contains(el)) || null;
    const re = /\\S+/g; let m;
    while ((m = re.exec(n.data))) {
      const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
      const rr = rg.getClientRects()[0];
      if (!rr || rr.width < 0.5) continue;
      palabras.push({ w: m[0], pieza, u: { l: rr.left, r: rr.right, t: rr.top, b: rr.bottom }, q: quad({ l: rr.left, r: rr.right, t: rr.top, b: rr.bottom }, pieza) });
    }
  }

  // 3. Fondo de cada pieza: su ::before (o la propia caja si no tiene), con el derrame del filtro.
  const derrame = (filtroCss, w, h) => {
    const id = (filtroCss || '').match(/url\\("?#([^")]+)"?\\)/);
    if (!id) return { x: 0, y: 0 };
    const f = document.getElementById(id[1]);
    if (!f) return { x: 0, y: 0, falta: id[1] };
    const d = f.querySelector('feDisplacementMap');
    const s = d ? +d.getAttribute('scale') / 2 : 0;
    const pc = (a, def) => { const v = f.getAttribute(a); return v == null ? def : v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v); };
    const fx = -pc('x', -0.1), fy = -pc('y', -0.1);
    return { x: Math.min(s, Math.max(0, fx) * w), y: Math.min(s, Math.max(0, fy) * h) };
  };
  const filas = todas.map(p => {
    const cs = getComputedStyle(p), bs = getComputedStyle(p, '::before');
    const u = p.getBoundingClientRect();
    const conBefore = bs.content && bs.content !== 'none' && bs.backgroundColor !== 'rgba(0, 0, 0, 0)';
    let r = { l: u.left, r: u.right, t: u.top, b: u.bottom };
    let mb = [1, 0, 0, 1, 0, 0], ob = null, filtroCss = cs.filter;
    if (conBefore) {
      const px = v => parseFloat(v) || 0;
      r = { l: u.left + px(bs.left), r: u.right - px(bs.right), t: u.top + px(bs.top), b: u.bottom - px(bs.bottom) };
      mb = matriz(bs.transform);
      const ot = bs.transformOrigin.split(' ').map(parseFloat);
      ob = { x: r.l + ot[0], y: r.t + ot[1] };
      filtroCss = bs.filter;
    }
    const d = derrame(filtroCss, r.r - r.l, r.b - r.t);
    const anchoFondo = r.r - r.l;
    const re = { l: r.l - d.x, r: r.r + d.x, t: r.t - d.y, b: r.b + d.y };
    let esq = [{ x: re.l, y: re.t }, { x: re.r, y: re.t }, { x: re.r, y: re.b }, { x: re.l, y: re.b }];
    if (ob) esq = esq.map(q => aplicar(mb, ob, q));
    const i = info.get(p);
    const o = { x: u.left + i.origen[0], y: u.top + i.origen[1] };
    const fondo = esq.map(q => aplicar(i.m, o, q));

    const propias = palabras.filter(w => w.pieza === p);
    const lineas = [];
    propias.forEach(w => { const l = lineas.find(x => Math.abs(x.t - w.u.t) < (w.u.b - w.u.t) / 2); l ? l.ws.push(w) : lineas.push({ t: w.u.t, ws: [w] }); });
    const anchoTexto = propias.length ? Math.max(...propias.map(w => w.u.r)) - Math.min(...propias.map(w => w.u.l)) : 0;
    const grupoEl = p.closest('[data-resaltado], h1, h2, h3, h4, p, li') || p;
    const palabrasGrupo = palabras.filter(w => w.pieza && grupoEl.contains(w.pieza)).length;
    const letras = propias.length === 1 ? (propias[0].w.match(/[\\p{L}\\p{N}]/gu) || []).length : 99;
    return { p, fondo, anchoFondo, anchoTexto, lineas, palabrasGrupo, letras, rot: +(grados(i.m) + grados(mb)).toFixed(2), altoFondo: +(r.b - r.t).toFixed(1), derrame: d };
  });

  // 4. Separación con las palabras vecinas, punto a punto sobre el tramo compartido.
  const rangoY = (q, x) => {
    const ys = [];
    for (let k = 0; k < 4; k++) { const a = q[k], b = q[(k + 1) % 4]; if ((x - a.x) * (x - b.x) <= 0 && a.x !== b.x) ys.push(a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x)); }
    return ys.length ? [Math.min(...ys), Math.max(...ys)] : null;
  };
  const xs = q => [Math.min(...q.map(v => v.x)), Math.max(...q.map(v => v.x))];
  const cy = q => q.reduce((s, v) => s + v.y, 0) / 4;
  const salida = filas.filter(f => piezas.includes(f.p)).map(f => {
    // Separación con los otros fondos (piezas apiladas): no se funden en una losa.
    let gapFondo = null;
    filas.forEach(g => {
      if (g === f) return;
      const [gl, gr] = xs(g.fondo), [fl2, fr2] = xs(f.fondo);
      const a = Math.max(fl2, gl) + 0.01, b = Math.min(fr2, gr) - 0.01;
      if (a >= b) return;
      const arriba = cy(g.fondo) < cy(f.fondo);
      let m = Infinity;
      for (let k = 0; k <= 10; k++) {
        const x = a + (b - a) * k / 10;
        const rf = rangoY(f.fondo, x), rg = rangoY(g.fondo, x);
        if (!rf || !rg) continue;
        m = Math.min(m, arriba ? rf[0] - rg[1] : rg[0] - rf[1]);
      }
      if (m !== Infinity && (gapFondo === null || m < gapFondo)) gapFondo = +m.toFixed(1);
    });
    let gapArriba = null, gapAbajo = null, gapLado = null, vecinaArriba = '', vecinaAbajo = '', vecinaLado = '';
    const [fl, fr] = xs(f.fondo);
    palabras.forEach(w => {
      if (w.pieza === f.p) return;
      const [wl, wr] = xs(w.q);
      // Palabra de la misma línea (su centro cae dentro del alto del fondo): separación lateral.
      const rc = rangoY(f.fondo, (fl + fr) / 2);
      if (rc && cy(w.q) > rc[0] && cy(w.q) < rc[1]) {
        const g = +(wl >= (fl + fr) / 2 ? wl - fr : fl - wr).toFixed(1);
        if (gapLado === null || g < gapLado) { gapLado = g; vecinaLado = w.w; }
        return;
      }
      const a = Math.max(fl, wl) + 0.01, b = Math.min(fr, wr) - 0.01;
      if (a >= b) return;
      const arriba = cy(w.q) < cy(f.fondo);
      let g = Infinity;
      for (let k = 0; k <= 10; k++) {
        const x = a + (b - a) * k / 10;
        const rf = rangoY(f.fondo, x), rw = rangoY(w.q, x);
        if (!rf || !rw) continue;
        g = Math.min(g, arriba ? rf[0] - rw[1] : rw[0] - rf[1]);
      }
      if (g === Infinity) return;
      g = +g.toFixed(1);
      if (arriba && (gapArriba === null || g < gapArriba)) { gapArriba = g; vecinaArriba = w.w; }
      if (!arriba && (gapAbajo === null || g < gapAbajo)) { gapAbajo = g; vecinaAbajo = w.w; }
    });
    const texto = f.lineas.map(l => l.ws.map(w => w.w).join(' ')).join(' / ');
    const hoja = [...f.p.querySelectorAll('*')].find(e => e.childNodes.length && [...e.childNodes].some(c => c.nodeType === 3 && c.data.trim())) || f.p;
    const cst = getComputedStyle(hoja);
    return {
      uso, texto, lineas: f.lineas.length, exceso: Math.round(f.anchoFondo - f.anchoTexto),
      anchoFondo: Math.round(f.anchoFondo), anchoTexto: Math.round(f.anchoTexto), altoFondo: f.altoFondo,
      palabraCorta: f.lineas.length === 1 && f.letras <= 3 && f.palabrasGrupo > 1,
      gapArriba, gapAbajo, gapLado, gapFondo, vecinaArriba, vecinaAbajo, vecinaLado, rot: f.rot,
      fontSize: cst.fontSize, lineHeight: getComputedStyle(f.p.parentElement).lineHeight, color: cst.color,
      derrame: f.derrame, clase: String(f.p.className).slice(0, 80),
    };
  });

  // 5. Devuelve los giros como estaban.
  todas.forEach(p => { const i = info.get(p); p.style.removeProperty('transform'); if (i.previo) p.style.setProperty('transform', i.previo, i.prioridad); });
  return salida;
})
`;

// Caja de captura: las piezas del uso con un margen, en coordenadas de documento.
const CAJA = `
(function caja({ raiz, filtro, piezasSel, margen }) {
  const root = document.querySelector(raiz); if (!root) return null;
  let ps = [...root.querySelectorAll(piezasSel)].filter(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
  if (filtro) { const f = new Function('p', 'return ' + filtro); ps = ps.filter(p => { try { return f(p); } catch { return false; } }); }
  if (!ps.length) return null;
  const rs = ps.map(e => e.getBoundingClientRect());
  const l = Math.max(0, Math.min(...rs.map(r => r.left)) - margen);
  const t = Math.max(0, Math.min(...rs.map(r => r.top)) + scrollY - margen);
  const r = Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + margen);
  const b = Math.max(...rs.map(r => r.bottom)) + scrollY + margen;
  return [l, t, r - l, b - t];
})
`;

async function main(browserWs) {
  const ws = new WebSocket(browserWs);
  await new Promise(r => ws.once('open', r));
  let id = 0;
  const pend = new Map();
  const eventos = [];
  ws.on('message', raw => {
    const msg = JSON.parse(raw);
    if (msg.id && pend.has(msg.id)) {
      pend.get(msg.id)(msg);
      pend.delete(msg.id);
    } else if (msg.method) eventos.push(msg);
  });
  const enviar = (method, params = {}, sessionId) =>
    new Promise(res => {
      const i = ++id;
      pend.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params, sessionId }));
    });
  const evalua = async (s, expression) => {
    const r = await enviar(
      'Runtime.evaluate',
      { expression, returnByValue: true, awaitPromise: true },
      s
    );
    if (r.result?.exceptionDetails)
      throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
    return r.result?.result?.value;
  };

  const resultados = [];
  for (const lang of LANGS)
    for (const [w, h] of ANCHOS) {
      const { result: t } = await enviar('Target.createTarget', { url: 'about:blank' });
      const { result: a } = await enviar('Target.attachToTarget', {
        targetId: t.targetId,
        flatten: true,
      });
      const s = a.sessionId;
      await enviar('Page.enable', {}, s);
      await enviar(
        'Emulation.setDeviceMetricsOverride',
        { width: w, height: h, deviceScaleFactor: 1, mobile: false },
        s
      );
      let cargada = null;
      const cargar = async (q, espera = 3000) => {
        eventos.length = 0;
        await enviar('Page.navigate', { url: 'about:blank' }, s);
        await dormir(200);
        eventos.length = 0;
        await enviar(
          'Page.navigate',
          { url: `${URL_BASE}${lang === 'es' ? '' : '/' + lang}${q}` },
          s
        );
        for (let i = 0; i < 100 && !eventos.some(e => e.method === 'Page.loadEventFired'); i++)
          await dormir(200);
        await dormir(espera);
        await evalua(s, 'document.fonts.ready.then(() => true)');
        cargada = q;
      };
      const clic = async sel => {
        await evalua(
          s,
          `(document.querySelector(${JSON.stringify(sel)})?.scrollIntoView({ block: 'center' }), true)`
        );
        await dormir(600);
        const c = await evalua(
          s,
          `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`
        );
        if (!c) throw new Error('no existe ' + sel);
        for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased'])
          await enviar(
            'Input.dispatchMouseEvent',
            { type, x: c[0], y: c[1], button: 'left', clickCount: 1 },
            s
          );
      };
      const foto = async (u, margen) => {
        if (!FOTOS) return null;
        const caja = await evalua(
          s,
          `${CAJA}(${JSON.stringify({ raiz: u.raiz, filtro: u.filtro, piezasSel: PIEZAS, margen })})`
        );
        if (!caja) return null;
        const vista = await evalua(s, '[scrollY, scrollY + innerHeight]');
        const dentro = caja[1] >= vista[0] && caja[1] + caja[3] <= vista[1];
        const { result: shot } = await enviar(
          'Page.captureScreenshot',
          {
            format: 'png',
            clip: { x: caja[0], y: caja[1], width: caja[2], height: caja[3], scale: 1 },
            captureBeyondViewport: !dentro,
          },
          s
        );
        const f = path.join(OUT, `${PREFIJO}-${u.uso}-${lang}-${w}.png`);
        fs.writeFileSync(f, Buffer.from(shot.data, 'base64'));
        return `${path.basename(f)} ${fs.statSync(f).size}`;
      };
      const medirUso = async u => {
        const filas = await evalua(
          s,
          `${MEDIR}(${JSON.stringify({ uso: u.uso, raiz: u.raiz, filtro: u.filtro, piezasSel: PIEZAS })})`
        );
        const f = await foto(u, u.margen || 40);
        filas.forEach(x => resultados.push({ lang, ancho: w, ...x }));
        decir(`${lang} ${w} ${u.uso}: ${filas.length} piezas ${f || ''}`);
      };

      let pagina = false;
      let modalAbierto = 0;
      for (const u of USOS) {
        try {
          if (u.carga) {
            await cargar(u.carga, 3000);
            await dormir(1500);
            await medirUso(u);
          } else if (u.modal) {
            if (modalAbierto === 0) {
              await cargar('', 3500);
              pagina = false;
              await clic('#mapa button:not([data-saltar-mapa])');
              await dormir(1800);
              modalAbierto = 1;
            }
            while (modalAbierto < u.modal) {
              await evalua(
                s,
                `(document.querySelector('[role=dialog] [data-sheet-next]').click(), true)`
              );
              await dormir(2300);
              modalAbierto++;
            }
            await medirUso(u);
          } else if (u.drawer) {
            if (cargada !== '#sumate') {
              await cargar('#sumate', 4000);
              pagina = false;
              modalAbierto = 0;
            }
            if (u.antes) {
              await evalua(
                s,
                `(document.querySelector(${JSON.stringify(u.antes)})?.click(), true)`
              );
              await dormir(1200);
            }
            await evalua(
              s,
              `(() => { const f = new Function('p', 'return ' + ${JSON.stringify(u.filtro)}); const p = [...document.querySelectorAll(${JSON.stringify(PIEZAS)})].find(x => { try { return f(x); } catch { return false; } }); p?.scrollIntoView({ block: 'center' }); return true; })()`
            );
            await dormir(900);
            await medirUso(u);
          } else {
            if (!pagina || cargada !== '') {
              await cargar('', 3500);
              modalAbierto = 0;
              const alto = await evalua(s, 'document.documentElement.scrollHeight');
              for (let y = 0; y < alto; y += Math.round(h * 0.6)) {
                await evalua(s, `(window.scrollTo(0, ${y}), true)`);
                await dormir(150);
              }
              pagina = true;
            }
            await evalua(
              s,
              `(() => { const r = document.querySelector(${JSON.stringify(u.raiz)}); const f = new Function('p', 'return ' + ${JSON.stringify(u.filtro || 'true')}); const p = [...r.querySelectorAll(${JSON.stringify(PIEZAS)})].find(x => { try { return f(x); } catch { return false; } }); (p || r).scrollIntoView({ block: 'center' }); return true; })()`
            );
            await dormir(u.uso.startsWith('impacto') ? 4500 : 1500);
            await medirUso(u);
          }
        } catch (e) {
          console.error(`${lang} ${w} ${u.uso}: ERROR ${e.message}`);
          resultados.push({ lang, ancho: w, uso: u.uso, error: e.message });
        }
      }
      await enviar('Target.closeTarget', { targetId: t.targetId });
    }
  ws.close();

  const archivo = path.join(OUT, `${PREFIJO}-medidas-${LANGS.join('')}.json`);
  fs.writeFileSync(archivo, JSON.stringify(resultados, null, 1));
  tabla(resultados);
  decir(`\nMedidas en ${archivo}`);
}

// Veredicto por uso, idioma y ancho.
function tabla(resultados) {
  const fallos = r => {
    if (r.error) return [r.error];
    const f = [];
    if (r.lineas !== 1) f.push(`${r.lineas} líneas`);
    if (r.exceso > EXCESO_MAX) f.push(`exceso ${r.exceso}`);
    if (r.palabraCorta) f.push(`palabra corta "${r.texto}"`);
    if (r.gapArriba !== null && r.gapArriba < -TOLERANCIA)
      f.push(`pisa arriba ${r.gapArriba} ("${r.vecinaArriba}")`);
    if (r.gapAbajo !== null && r.gapAbajo < -TOLERANCIA)
      f.push(`pisa abajo ${r.gapAbajo} ("${r.vecinaAbajo}")`);
    if (r.gapLado !== null && r.gapLado < -TOLERANCIA)
      f.push(`pisa al lado ${r.gapLado} ("${r.vecinaLado}")`);
    if (r.gapFondo !== null && r.gapFondo < -TOLERANCIA) f.push(`fondos fundidos ${r.gapFondo}`);
    // Donaciones: las cintas de papel se montan entre sí y sobre las líneas vecinas por diseño
    // (Figma 1288:1478), y todo el texto va por encima de todas las cintas, así que nada se tapa.
    // Su tercera cinta de desktop sobresale 19,8 px a la derecha (1294:1762): el exceso también
    // es del diseño.
    if (r.uso === 'donaciones') return f.filter(x => !/^pisa|^fondos|^exceso/.test(x));
    return f;
  };
  const grupos = new Map();
  resultados.forEach(r => {
    const k = `${r.uso}|${r.lang}|${r.ancho}`;
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(r);
  });
  let pasan = 0;
  let fallan = 0;
  decir('\nuso | lang | ancho | piezas | peor sep. arriba / abajo | veredicto');
  for (const [k, rs] of grupos) {
    const f = rs.flatMap(r => fallos(r).map(x => `${r.texto}: ${x}`));
    const arr = rs.map(r => r.gapArriba).filter(v => v !== null && v !== undefined);
    const aba = rs.map(r => r.gapAbajo).filter(v => v !== null && v !== undefined);
    const peor = `${arr.length ? Math.min(...arr) : '-'} / ${aba.length ? Math.min(...aba) : '-'}`;
    const ok = f.length === 0 && rs.length > 0;
    ok ? pasan++ : fallan++;
    decir(
      `${k.split('|').join(' | ')} | ${rs.length} | ${peor} | ${ok ? 'PASA' : 'FALLA: ' + f.join('; ')}`
    );
  }
  decir(`\nPasan ${pasan}, fallan ${fallan}`);
}

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--remote-debugging-port=0',
  'about:blank',
]);
chrome.stderr.on('data', async chunk => {
  const m = /DevTools listening on (ws:\S+)/.exec(chunk.toString());
  if (!m) return;
  try {
    await main(m[1]);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    chrome.kill();
    setTimeout(() => process.exit(), 500);
  }
});
