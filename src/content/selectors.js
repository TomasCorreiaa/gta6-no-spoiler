// Configuração de seletores por site num único sítio.

const GTA6NS_SITE = (() => {
  const noWatch = () => null;

  const SITES = [
    {
      id: 'youtube',
      match: (h) => h.endsWith('youtube.com'),
      homeUrl: 'https://www.youtube.com/',
      cards: [
        'ytd-rich-item-renderer', 'ytd-video-renderer', 'ytd-compact-video-renderer',
        'ytd-grid-video-renderer', 'ytd-playlist-renderer', 'ytd-compact-playlist-renderer',
        'ytd-radio-renderer', 'ytd-compact-radio-renderer', 'ytd-reel-item-renderer',
        'ytd-playlist-panel-video-renderer', 'ytd-notification-renderer', 'yt-lockup-view-model',
        'ytm-shorts-lockup-view-model', 'ytm-shorts-lockup-view-model-v2',
        'ytm-video-with-context-renderer', 'ytm-compact-video-renderer',
        '.ytp-ce-element', '.ytp-videowall-still', '.ytp-modern-videowall-still',
      ].join(','),
      cardChannel: [
        'ytd-channel-name #text', '#channel-name #text',
        '.yt-content-metadata-view-model__metadata-text a', '.yt-core-attributed-string__link',
      ].join(','),
      watchTitle: 'ytd-watch-metadata #title h1, h1.ytd-watch-metadata',
      watchChannel: 'ytd-watch-metadata ytd-channel-name #text, #owner ytd-channel-name #text',
      watchExtra: '',
      getWatchId() {
        const url = new URL(location.href);
        if (url.pathname === '/watch') return url.searchParams.get('v');
        const shorts = url.pathname.match(/^\/shorts\/([^/?]+)/);
        return shorts ? shorts[1] : null;
      },
    },
    {
      id: 'twitch',
      match: (h) => h.endsWith('twitch.tv'),
      homeUrl: 'https://www.twitch.tv/',
      cards: [
        'article', '[data-a-target="side-nav-card"]', '[data-target="shelf-card"]',
        '[data-a-target="search-result-live-channel"]', '[data-a-target="search-result-video"]',
        '[data-a-target="search-result-clip"]', '[data-a-target="search-result-category"]',
        '.front-page-carousel',
      ].join(','),
      cardChannel: '[data-a-target="preview-card-channel-link"], [data-a-target="side-nav-title"], .side-nav-card__title',
      watchTitle: '[data-a-target="stream-title"], h2[data-a-target="stream-title"], [data-test-selector="stream-info-card-component__subtitle"]',
      watchChannel: 'h1.tw-title, [data-a-target="user-channel-header-item"] h1',
      watchExtra: '[data-a-target="stream-game-link"], a[href*="/directory/category/"]',
      getWatchId() {
        const path = location.pathname.replace(/\/+$/, '');
        if (!path || path === '/directory' || path.startsWith('/search')) return null;
        if (/^\/(?:directory\/(?:all|following|gaming)|settings|subscriptions|inventory|drops|wallet|turbo|downloads|jobs)/.test(path)) {
          return null;
        }
        return path;
      },
    },
    {
      id: 'tiktok',
      match: (h) => h.endsWith('tiktok.com'),
      homeUrl: 'https://www.tiktok.com/',
      cards: [
        '[data-e2e="recommend-list-item-container"]',
        '[data-e2e="search_top-item"]',
        '[data-e2e="search_video-item"]',
        '[data-e2e="user-post-item"]',
        '[data-e2e="challenge-item"]',
      ].join(','),
      cardChannel: '[data-e2e="video-author-uniqueid"], [data-e2e="search-card-user-unique-id"]',
      watchTitle: '[data-e2e="browse-video-desc"]',
      watchChannel: '[data-e2e="browse-username"]',
      getWatchId() {
        const m = location.pathname.match(/^\/@[^/]+\/video\/\d+/);
        return m ? m[0] : null;
      },
    },
    {
      id: 'twitter',
      match: (h) => h === 'x.com' || h.endsWith('.x.com') || h === 'twitter.com' || h.endsWith('.twitter.com'),
      homeUrl: 'https://x.com/',
      cards: 'article[data-testid="tweet"], [data-testid="cellInnerDiv"]:has([data-testid="trend"])',
      cardChannel: '[data-testid="User-Name"]',
      getWatchId: noWatch,
    },
    {
      id: 'facebook',
      match: (h) => h.endsWith('facebook.com'),
      homeUrl: 'https://www.facebook.com/',
      cards: '[role="article"], [data-pagelet^="FeedUnit_"]',
      cardChannel: 'h2 a, h3 a, strong a',
      getWatchId: noWatch,
    },
    {
      id: 'instagram',
      match: (h) => h.endsWith('instagram.com'),
      homeUrl: 'https://www.instagram.com/',
      cards: 'article, main a[href*="/p/"], main a[href*="/reel/"]',
      cardChannel: 'header a',
      getWatchId: noWatch,
    },
    {
      id: 'whatsapp',
      match: (h) => h === 'web.whatsapp.com',
      homeUrl: 'https://web.whatsapp.com/',
      // Esconde/desfoca mensagens individuais e a pré-visualização da última mensagem (mantém o contacto clicável)
      cards: '#main [role="row"], [data-testid="msg-container"], [data-testid="cell-frame-secondary"]',
      cardChannel: '[data-pre-plain-text]',
      getWatchId: noWatch,
    },
  ];

  const host = location.hostname;
  return SITES.find((s) => s.match(host)) || SITES[0];
})();
