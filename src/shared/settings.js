// Definições partilhadas entre o content script e o popup.

const GTA6NS_DEFAULTS = Object.freeze({
  enabled: true,
  mode: 'hide', // 'hide' | 'blur'
  allowTrailers: false,
  allowReactions: false,
  officialOnly: false,
  hideComments: true,
  strictTerms: false, // inclui termos ambíguos (vice city, lucia, rockstar)
  sites: {
    youtube: true,
    twitch: true,
    tiktok: true,
    twitter: true,
    facebook: true,
    instagram: true,
    whatsapp: true,
  },
  customKeywords: [],
  blockedChannels: [],
  allowedChannels: [],
  pausedUntil: 0,
});

const GTA6NS_COUNTER_KEY = 'blockedCount';

async function gta6nsLoadSettings() {
  const data = await chrome.storage.sync.get(GTA6NS_DEFAULTS);
  return { ...data, sites: { ...GTA6NS_DEFAULTS.sites, ...data.sites } };
}

function gta6nsSaveSettings(partial) {
  return chrome.storage.sync.set(partial);
}

function gta6nsIsActive(settings, siteId) {
  return settings.enabled && Date.now() >= settings.pausedUntil && (!siteId || settings.sites?.[siteId] !== false);
}
