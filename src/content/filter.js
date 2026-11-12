// Lógica pura de filtragem (sem DOM) — testável em Node com `node --test`.

const GTA6Filter = (() => {
  const VERDICT = Object.freeze({ SHOW: 'show', BLOCK: 'block' });

  const BASE_TERMS = [
    /\bgta\s*(?:6|vi)\b/,
    /\bgrand\s*theft\s*auto\s*(?:6|vi)\b/,
    /\bleonida\b/,
    /\bjason\s*(?:e|and|y|n)\s*lucia\b/,
    /\bport\s*gellhorn\b/,
  ];

  const AMBIGUOUS_TERMS = [/\bvice\s*city\b/, /\blucia\b/, /\brockstar\b/];

  const TRAILER = /\btrailers?\b/;
  const REACTION = /\b(?:react\w*|reac(?:ao|oes|cion\w*)|reag\w*)\b/;

  // Mesmo num "trailer", estes termos indicam conteúdo com risco de spoiler.
  const RISK = new RegExp(
    '\\b(?:' +
      [
        'leaks?', 'leaked', 'breakdown', 'analys[ie]s', 'analise', 'every\\s*detail', 'detalhes',
        'everything', 'gameplay', 'walkthrough', 'playthrough', 'ending', 'endings', 'final',
        'story', 'historia', 'spoilers?', 'maps?', 'mapa', 'missions?', 'missao', 'missoes',
        'cutscenes?', 'secrets?', 'segredos?', 'easter\\s*eggs?', 'theory', 'teoria', 'boss',
        'part\\s*\\d+', 'parte\\s*\\d+', 'episode', 'episodio',
      ].join('|') +
      ')\\b'
  );

  const OFFICIAL_CHANNEL = 'rockstar games';

  function normalize(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function toSet(list) {
    return new Set((list || []).map(normalize).filter(Boolean));
  }

  // Pré-compila as definições uma vez (evita recriar regex por cada cartão).
  function compile(settings) {
    const custom = (settings.customKeywords || [])
      .map(normalize)
      .filter(Boolean)
      .map((kw) => new RegExp(`\\b${escapeRegex(kw).replace(/ /g, '\\s*')}\\b`));

    return {
      terms: [...BASE_TERMS, ...(settings.strictTerms ? AMBIGUOUS_TERMS : []), ...custom],
      blockedChannels: toSet(settings.blockedChannels),
      allowedChannels: toSet(settings.allowedChannels),
      allowTrailers: Boolean(settings.allowTrailers),
      allowReactions: Boolean(settings.allowReactions),
      officialOnly: Boolean(settings.officialOnly),
    };
  }

  function mentionsGta6(text, rules) {
    return rules.terms.some((re) => re.test(text));
  }

  function isAllowedTrailer(text, channel, rules) {
    if (!TRAILER.test(text) || RISK.test(text)) return false;
    if (REACTION.test(text)) return rules.allowReactions;
    if (!rules.allowTrailers) return false;
    return !rules.officialOnly || channel === OFFICIAL_CHANNEL;
  }

  // text: título (ou todo o texto do cartão); channel: nome do canal (pode ser vazio)
  function evaluate({ text, channel }, rules) {
    const t = normalize(text);
    const c = normalize(channel);

    if (c && rules.allowedChannels.has(c)) return VERDICT.SHOW;
    if (c && rules.blockedChannels.has(c)) return VERDICT.BLOCK;
    if (!mentionsGta6(`${t} ${c}`, rules)) return VERDICT.SHOW;
    if (isAllowedTrailer(t, c, rules)) return VERDICT.SHOW;
    return VERDICT.BLOCK;
  }

  return { VERDICT, compile, evaluate, normalize, mentionsGta6 };
})();

if (typeof module !== 'undefined') module.exports = GTA6Filter;

