const test = require('node:test');
const assert = require('node:assert/strict');
const { compile, evaluate, VERDICT } = require('../src/content/filter.js');

const DEFAULTS = {
  allowTrailers: false,
  allowReactions: false,
  officialOnly: false,
  strictTerms: false,
  customKeywords: [],
  blockedChannels: [],
  allowedChannels: [],
};

const check = (text, overrides = {}, channel = '') =>
  evaluate({ text, channel }, compile({ ...DEFAULTS, ...overrides }));

test('bloqueia variações de GTA 6', () => {
  for (const title of [
    'GTA 6 gameplay leaked!',
    'gta6 everything we know',
    'GTA VI: Jason & Lucia story',
    'Grand Theft Auto VI Trailer 2',
    '#GTA6 shorts',
    'GTA-VI map size',
    'Explorando Leonida',
    'grand theft auto 6 é incrível',
  ]) {
    assert.equal(check(title), VERDICT.BLOCK, title);
  }
});

test('não bloqueia conteúdo não relacionado', () => {
  for (const title of [
    'GTA 5 online heist',
    'GTA Vice City Definitive Edition',
    'Minecraft 1.21 update',
    'iPhone 16 review',
    'GTA 60fps mod for San Andreas',
  ]) {
    assert.equal(check(title), VERDICT.SHOW, title);
  }
});

test('termos ambíguos só em modo estrito', () => {
  assert.equal(check('Vice City is back'), VERDICT.SHOW);
  assert.equal(check('Vice City is back', { strictTerms: true }), VERDICT.BLOCK);
});

test('trailers permitidos apenas com a opção ativa', () => {
  const title = 'Grand Theft Auto VI Trailer 2';
  assert.equal(check(title, {}, 'Rockstar Games'), VERDICT.BLOCK);
  assert.equal(check(title, { allowTrailers: true }, 'Rockstar Games'), VERDICT.SHOW);
  assert.equal(check(title, { allowTrailers: true }, 'Random Channel'), VERDICT.SHOW);
  assert.equal(check(title, { allowTrailers: true, officialOnly: true }, 'Random Channel'), VERDICT.BLOCK);
  assert.equal(check(title, { allowTrailers: true, officialOnly: true }, 'Rockstar Games'), VERDICT.SHOW);
});

test('reações a trailers são uma opção separada', () => {
  for (const title of ['GTA 6 Trailer 2 REACTION', 'Reação ao trailer de GTA 6', 'Reacting to GTA VI trailer']) {
    assert.equal(check(title, { allowTrailers: true }), VERDICT.BLOCK, title);
    assert.equal(check(title, { allowReactions: true }), VERDICT.SHOW, title);
  }
});

test('trailers com termos de risco continuam bloqueados', () => {
  const opts = { allowTrailers: true, allowReactions: true };
  for (const title of [
    'GTA 6 Trailer 2 Breakdown - every detail',
    'GTA 6 trailer analysis',
    'Análise do trailer de GTA 6',
    'GTA 6 trailer leak',
    'GTA 6 trailer map comparison',
  ]) {
    assert.equal(check(title, opts), VERDICT.BLOCK, title);
  }
});

test('listas de canais e palavras-chave do utilizador', () => {
  assert.equal(check('Daily news', { blockedChannels: ['GTA Leaks Daily'] }, 'gta leaks daily'), VERDICT.BLOCK);
  assert.equal(check('GTA 6 news', { allowedChannels: ['Friendly Channel'] }, 'Friendly Channel'), VERDICT.SHOW);
  assert.equal(check('Meet Cal Hampton', { customKeywords: ['Cal Hampton'] }), VERDICT.BLOCK);
});

test('canal com nome GTA 6 é bloqueado mesmo sem título', () => {
  assert.equal(check('My new video', {}, 'GTA 6 News'), VERDICT.BLOCK);
});

