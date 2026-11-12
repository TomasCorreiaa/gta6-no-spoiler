# Chrome Web Store — Guia de Submissão

Este ficheiro contém os textos prontos a copiar para o **Chrome Web Store Developer Dashboard** e a checklist do que falta fazer manualmente antes de submeter.

---

## 1. Ficheiro da extensão (ZIP)
- Já gerado em `dist/gta6-no-spoiler-1.0.0.zip` (via `npm run package`).
- Contém apenas: `manifest.json`, `_locales/`, `icons/`, `src/`.

---

## 2. Campos obrigatórios no Dashboard

### Store Listing
- **Category:** `Accessibility` ou `Productivity` (ou `Social & Communication` / `Entertainment` conforme preferires; `Productivity` costuma ser a escolha padrão para filtros de feed).
- **Language:** `English` (default) + `Portuguese (Portugal)` (`_locales/pt_PT`).
- **Detailed Description (EN):**
```text
Stay spoiler-free online. Avoid GTA 6 spoilers across your favorite platforms without leaving them.

No Spoiler for GTA6 automatically hides or blurs GTA 6 spoilers across YouTube, Twitch, TikTok, X (Twitter), Facebook, Instagram, and WhatsApp Web.

Features:
• Automatic filtering: detects GTA 6, GTA VI, Grand Theft Auto 6, Leonida, Jason & Lucia, and related terms.
• Per-platform toggles: choose which platforms to protect (YouTube, Twitch, TikTok, X, Facebook, Instagram, WhatsApp).
• Hide or Blur mode: completely hide spoilers or blur them with click-to-reveal.
• Trailers & Reactions (optional): allow official trailers (with an option for Rockstar Games channel only) and trailer reactions while still blocking leaks, breakdowns, and gameplay spoilers.
• Watch-page protection: overlays direct links to GTA 6 videos/streams and can hide comments and live chat.
• Custom lists: add extra keywords, blocked channels, or always-allowed channels.
• Quick pause: pause protection for 15 minutes with one click.
• 100% local & private: zero tracking, zero analytics, no external servers.

Disclaimer: This extension is not affiliated with, endorsed, or sponsored by Rockstar Games or Take-Two Interactive.
```

### Privacy Practices
- **Single Purpose Description:**
```text
Blocks or blurs GTA 6 related videos, streams, posts, and messages across YouTube, Twitch, TikTok, X (Twitter), Facebook, Instagram, and WhatsApp Web so users can browse without encountering spoilers.
```
- **Permission Justification — `storage`:**
```text
Used exclusively to save the user's filter preferences (enabled state, per-platform toggles, hide/blur mode, trailer/reaction options, and custom keyword/channel lists) via chrome.storage.sync, and a local counter of hidden spoilers via chrome.storage.local.
```
- **Permission Justification — Host permissions (`youtube.com`, `twitch.tv`, `tiktok.com`, `x.com`/`twitter.com`, `facebook.com`, `instagram.com`, `web.whatsapp.com`):**
```text
Required to run the content script on the supported platforms enabled by the user in order to inspect video titles, post text, and channel/author names locally in the browser and hide or blur GTA 6 related content.
```
- **Remote Code:** `No, I am not using Remote code` (todo o código está incluído no pacote).
- **Data Usage Certification:**
  - Não recolhe nenhum dos tipos de dados pessoais/sensíveis listados (deixar tudo desmarcado).
  - Confirmar as 3 declarações de conformidade (não vende dados, não usa para fins não relacionados, etc.).
- **Privacy Policy URL:** `https://tomascorreiaa.github.io/gta6-no-spoiler/`
- **Homepage / Support URL (opcional):** `https://github.com/TomasCorreiaa/gta6-no-spoiler`

---

## 3. Assets já prontos em `store-assets/`
- **Screenshots (`1280x800`):**
  - `store-assets/screenshot-1-popup-1280x800.png`
  - `store-assets/screenshot-2-blur-compare-1280x800.png`
  - `store-assets/screenshot-3-social-1280x800.png`
  - `store-assets/screenshot-4-overlay-1280x800.png`
- **Banners promocionais:**
  - Small promo tile (`440x280`): `store-assets/promo-small-440x280.png`
  - Marquee promo tile (`1400x560`): `store-assets/promo-marquee-1400x560.png`

## 4. Submissão na Chrome Web Store
1. Ativar GitHub Pages em `https://github.com/TomasCorreiaa/gta6-no-spoiler/settings/pages` (`main` → `/docs`) para publicar `https://tomascorreiaa.github.io/gta6-no-spoiler/`.
2. Fazer upload de `dist/gta6-no-spoiler-1.0.0.zip` no Developer Dashboard.
3. Preencher os campos acima, anexar os screenshots/banners e clicar em **Submit for review**.

