// Content script: observa o DOM (YouTube e Twitch) e esconde/desfoca conteúdo relacionado com GTA 6.

(() => {
  const { VERDICT, compile, evaluate, normalize, mentionsGta6 } = GTA6Filter;
  const S = GTA6NS_SITE;
  const CLS = { hidden: 'gta6ns-hidden', blur: 'gta6ns-blur', noComments: 'gta6ns-hide-comments' };

  let settings = null;
  let rules = null;
  let lastText = new WeakMap(); // cartão -> texto já avaliado (o YouTube recicla nós)
  const revealed = new WeakSet(); // cartões desfocados que o utilizador revelou
  const revealedVideos = new Set(); // ids de vídeos que o utilizador decidiu ver
  const pending = new Set();
  let flushScheduled = false;
  let fullScan = false;
  let newlyBlocked = 0;
  let pauseTimer = null;

  // ---------- Cartões ----------

  function readCard(card) {
    const channel = card.querySelector(S.cardChannel)?.textContent || '';
    const attrs = [...card.querySelectorAll('[title], [aria-label], [alt]')]
      .map((el) => el.getAttribute('title') || el.getAttribute('aria-label') || el.getAttribute('alt'))
      .join(' ');
    return { text: `${card.textContent} ${attrs}`, channel };
  }

  function setCardState(card, blocked) {
    const blur = blocked && settings.mode === 'blur' && !revealed.has(card);
    card.classList.toggle(CLS.hidden, blocked && settings.mode === 'hide');
    card.classList.toggle(CLS.blur, blur);
  }

  function processCard(card) {
    const data = readCard(card);
    if (lastText.get(card) === data.text) return;
    lastText.set(card, data.text);
    revealed.delete(card);

    const blocked = evaluate(data, rules) === VERDICT.BLOCK;
    const wasBlocked = card.classList.contains(CLS.hidden) || card.classList.contains(CLS.blur);
    setCardState(card, blocked);

    // Conta só o cartão mais exterior (há cartões aninhados, ex: rich-item > lockup)
    if (blocked && !wasBlocked && !card.parentElement?.closest(S.cards)) newlyBlocked++;
  }

  function clearAll() {
    document.querySelectorAll(`.${CLS.hidden}, .${CLS.blur}`).forEach((el) => {
      el.classList.remove(CLS.hidden, CLS.blur);
    });
    document.documentElement.classList.remove(CLS.noComments);
    removeOverlay();
  }

  // ---------- Página de vídeo ----------

  function processWatchPage() {
    const videoId = S.getWatchId();
    if (!videoId) {
      document.documentElement.classList.remove(CLS.noComments);
      removeOverlay();
      return;
    }

    const title = document.querySelector(S.watchTitle)?.textContent || document.title;
    const channel = document.querySelector(S.watchChannel)?.textContent || '';
    const extra = S.watchExtra ? document.querySelector(S.watchExtra)?.textContent || '' : '';
    const text = `${title} ${extra} ${location.pathname.replace(/[-_/]+/g, ' ')}`;
    const related = mentionsGta6(normalize(`${text} ${channel}`), rules);

    document.documentElement.classList.toggle(CLS.noComments, related && settings.hideComments);

    const blocked = evaluate({ text, channel }, rules) === VERDICT.BLOCK;
    if (blocked && !revealedVideos.has(videoId)) showOverlay(videoId);
    else removeOverlay();
  }

  let overlay = null;

  function pauseVideo() {
    if (overlay) document.querySelectorAll('video').forEach((v) => v.pause());
  }

  function showOverlay(videoId) {
    pauseVideo();
    if (overlay?.dataset.videoId === videoId) return;
    removeOverlay();

    const t = (key) => chrome.i18n.getMessage(key);
    overlay = document.createElement('div');
    overlay.className = 'gta6ns-overlay';
    overlay.dataset.videoId = videoId;

    const box = document.createElement('div');
    box.className = 'gta6ns-overlay-box';

    const heading = document.createElement('h2');
    heading.textContent = t('overlayTitle');
    const text = document.createElement('p');
    text.textContent = t('overlayText');

    const back = document.createElement('button');
    back.className = 'gta6ns-btn gta6ns-btn-primary';
    back.textContent = t('overlayBack');
    back.addEventListener('click', () => {
      if (history.length > 1) history.back();
      else location.assign(S.homeUrl);
    });

    const watch = document.createElement('button');
    watch.className = 'gta6ns-btn';
    watch.textContent = t('overlayWatch');
    watch.addEventListener('click', () => {
      revealedVideos.add(videoId);
      removeOverlay();
    });

    box.append(heading, text, back, watch);
    overlay.append(box);
    document.documentElement.append(overlay);
    document.addEventListener('play', pauseVideo, true);
  }

  function removeOverlay() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.removeEventListener('play', pauseVideo, true);
  }

  // ---------- Ciclo de processamento ----------

  let lastUrl = location.href;

  function flush() {
    flushScheduled = false;
    if (!rules) return;

    if (location.href !== lastUrl) {
      lastUrl = location.href;
      fullScan = true;
    }

    if (fullScan) {
      fullScan = false;
      pending.clear();
      document.querySelectorAll(S.cards).forEach(processCard);
    } else {
      pending.forEach((card) => card.isConnected && processCard(card));
      pending.clear();
    }

    processWatchPage();
    persistCounter();
  }

  function schedule() {
    if (flushScheduled) return;
    flushScheduled = true;
    requestAnimationFrame(flush);
  }

  // Cartão que contém o nó alterado (ex: título preenchido depois de o cartão existir)
  function collectAncestor(node) {
    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    const card = el?.closest(S.cards);
    if (card) pending.add(card);
  }

  // Cartões dentro de um nó acabado de adicionar
  function collectAdded(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.matches(S.cards)) pending.add(node);
    node.querySelectorAll(S.cards).forEach((c) => pending.add(c));
  }

  const observer = new MutationObserver((mutations) => {
    if (!rules) return;
    for (const m of mutations) {
      collectAncestor(m.target);
      m.addedNodes.forEach(collectAdded);
    }
    schedule();
  });

  function requestFullScan() {
    fullScan = true;
    schedule();
  }

  // ---------- Contador (storage.local, escrita agrupada) ----------

  let counterTimer = null;
  function persistCounter() {
    if (!newlyBlocked || counterTimer) return;
    counterTimer = setTimeout(async () => {
      counterTimer = null;
      const add = newlyBlocked;
      newlyBlocked = 0;
      const { [GTA6NS_COUNTER_KEY]: total = 0 } = await chrome.storage.local.get(GTA6NS_COUNTER_KEY);
      await chrome.storage.local.set({ [GTA6NS_COUNTER_KEY]: total + add });
    }, 2000);
  }

  // ---------- Revelar cartões desfocados ----------

  function reveal(el) {
    el.classList.remove(CLS.blur);
    revealed.add(el);
  }

  document.addEventListener(
    'click',
    (e) => {
      const blurred = e.target.closest?.(`.${CLS.blur}`);
      if (!blurred) return;
      e.preventDefault();
      e.stopPropagation();
      let el = blurred;
      while (el) {
        reveal(el);
        el.querySelectorAll(`.${CLS.blur}`).forEach(reveal);
        el = el.parentElement?.closest(`.${CLS.blur}`);
      }
    },
    true
  );

  // ---------- Definições ----------

  function applySettings(newSettings) {
    settings = newSettings;
    lastText = new WeakMap();
    clearTimeout(pauseTimer);

    if (!gta6nsIsActive(settings, S.id)) {
      rules = null;
      clearAll();
      if (settings.enabled && settings.pausedUntil > Date.now()) {
        pauseTimer = setTimeout(() => applySettings(settings), settings.pausedUntil - Date.now());
      }
      return;
    }

    rules = compile(settings);
    requestFullScan();
  }

  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area === 'sync') applySettings(await gta6nsLoadSettings());
  });

  document.addEventListener('yt-navigate-finish', requestFullScan);
  window.addEventListener('popstate', requestFullScan);

  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  gta6nsLoadSettings().then(applySettings);
})();
