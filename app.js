'use strict';

const input = document.querySelector('#territoryUrl');
const status = document.querySelector('#urlStatus');
const link = document.querySelector('#openLink');
const installButton = document.querySelector('#installButton');
let installPrompt = null;

function validateTerritoryUrl(value) {
  let url;
  try { url = new URL(value.trim()); } catch (_) { return null; }
  if (url.protocol !== 'https:' || url.hostname !== 'script.google.com' ||
      !/^\/macros\/s\/[^/]+\/exec\/?$/.test(url.pathname)) return null;
  const territory = Number(url.searchParams.get('t'));
  const token = url.searchParams.get('k');
  if (!Number.isSafeInteger(territory) || territory < 1 || !token || token.length > 256) return null;
  return url.href;
}

input.addEventListener('input', () => {
  const value = input.value.trim();
  const valid = validateTerritoryUrl(value);
  link.classList.toggle('desabilitado', !valid);
  link.setAttribute('aria-disabled', String(!valid));
  if (valid) link.href = valid;
  else link.removeAttribute('href');
  status.className = 'estado' + (value ? (valid ? ' ok' : ' erro') : '');
  status.textContent = value ? (valid ? 'Link reconhecido. Toque em Abrir território.' :
    'Cole o link completo do território, incluindo os parâmetros t e k.') :
    'O link fica somente nesta tela e não é salvo no aparelho.';
});

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
});
window.addEventListener('appinstalled', () => { installButton.hidden = true; });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js')
    .catch(() => { /* A entrada permanece acessível sem cache offline. */ }));
}
