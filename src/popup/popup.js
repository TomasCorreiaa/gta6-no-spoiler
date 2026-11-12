const PAUSE_MS = 15 * 60 * 1000;
const t = (key, sub) => chrome.i18n.getMessage(key, sub);

const form = document.body;
const pauseBtn = document.getElementById('pauseBtn');
const pausedInfo = document.getElementById('pausedInfo');
const counter = document.getElementById('counter');

const parseList = (text) => text.split('\n').map((s) => s.trim()).filter(Boolean);

function translate() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
}

function render(settings) {
  for (const [key, value] of Object.entries(settings)) {
    if (key === 'sites') continue;
    const inputs = form.querySelectorAll(`[name="${key}"]`);
    inputs.forEach((input) => {
      if (input.type === 'checkbox') input.checked = value;
      else if (input.type === 'radio') input.checked = input.value === value;
      else if (input.tagName === 'TEXTAREA') input.value = value.join('\n');
    });
  }
  form.querySelectorAll('[data-site]').forEach((input) => {
    input.checked = settings.sites?.[input.dataset.site] !== false;
  });
  form.querySelector('[name="officialOnly"]').disabled = !settings.allowTrailers;
  renderPause(settings);
}

function renderPause({ pausedUntil }) {
  const paused = pausedUntil > Date.now();
  const time = new Date(pausedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  pausedInfo.textContent = paused ? t('popupPausedUntil', [time]) : '';
  pauseBtn.textContent = paused ? t('popupResume') : t('popupPause');
  pauseBtn.dataset.paused = paused;
}

function readInput(input) {
  if (input.type === 'checkbox') return input.checked;
  if (input.tagName === 'TEXTAREA') return parseList(input.value);
  return input.value;
}

async function save(input) {
  if (input.dataset.site) {
    const { sites } = await gta6nsLoadSettings();
    return gta6nsSaveSettings({ sites: { ...sites, [input.dataset.site]: input.checked } });
  }
  if (input.name === 'allowTrailers') form.querySelector('[name="officialOnly"]').disabled = !input.checked;
  return gta6nsSaveSettings({ [input.name]: readInput(input) });
}

form.addEventListener('change', (e) => {
  if (e.target.name || e.target.dataset.site) save(e.target);
});

// Textareas: guardar enquanto se escreve (o popup pode fechar antes do evento "change")
let typingTimer = null;
form.addEventListener('input', (e) => {
  if (e.target.tagName !== 'TEXTAREA') return;
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => save(e.target), 400);
});

pauseBtn.addEventListener('click', async () => {
  const pausedUntil = pauseBtn.dataset.paused === 'true' ? 0 : Date.now() + PAUSE_MS;
  await gta6nsSaveSettings({ pausedUntil });
  renderPause({ pausedUntil });
});

async function init() {
  translate();
  render(await gta6nsLoadSettings());
  const { [GTA6NS_COUNTER_KEY]: total = 0 } = await chrome.storage.local.get(GTA6NS_COUNTER_KEY);
  counter.textContent = total.toLocaleString();
}

init();
