/**
 * Aviso de protección de menores en los scripts de verificación (docs/aviso/DECISIONES.md, D1).
 *
 * La landing lleva delante una puerta en la primera visita. Para que las capturas muestren la
 * landing, `fijarAviso` deja antes de navegar la cookie de "ya aceptado" con la versión vigente,
 * que lee de components/aviso/aviso.ts (así un cambio de versión no rompe las capturas). Con
 * `mostrar`, la borra y se ve la puerta. Lo usan scripts/captura.js y scripts/medir-resaltado.js.
 */
const fs = require('fs');
const path = require('path');

function cookieAviso() {
  const fuente = fs.readFileSync(path.join(__dirname, '../components/aviso/aviso.ts'), 'utf8');
  return {
    nombre: /COOKIE_AVISO = '([^']+)'/.exec(fuente)[1],
    valor: /VERSION_AVISO = '([^']+)'/.exec(fuente)[1],
  };
}

async function fijarAviso(enviar, sesion, base, mostrar) {
  const { nombre, valor } = cookieAviso();
  await enviar('Network.enable', {}, sesion);
  if (mostrar) await enviar('Network.deleteCookies', { name: nombre, url: base }, sesion);
  else
    await enviar('Network.setCookie', { name: nombre, value: valor, url: base, path: '/' }, sesion);
}

module.exports = { cookieAviso, fijarAviso };
