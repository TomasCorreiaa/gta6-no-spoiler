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
Avoid GTA 6 spoilers on YouTube without leaving the platform.

No Spoiler for GTA 6 automatically hides or blurs GTA 6 videos across your YouTube homepage, search results, channel pages, Shorts, and "Up Next" recommendations.

Features:
• Automatic filtering: detects GTA 6, GTA VI, Grand Theft Auto 6, Leonida, Jason & Lucia, and related terms.
• Hide or Blur mode: completely hide videos or blur them with click-to-reveal.
• Trailers & Reactions (optional): allow official trailers (with an option for Rockstar Games channel only) and trailer reactions while still blocking leaks, breakdowns, and gameplay spoilers.
• Watch-page protection: overlays direct links to GTA 6 videos and can hide comments on GTA 6 videos.
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
- **Privacy Policy URL:** alojar o ficheiro `PRIVACY.md` (ex.: num repositório GitHub público ou GitHub Pages) e colar o URL público, depois de substituir `[YOUR EMAIL HERE]` pelo teu email.

---

## 3. O que precisamos de ti (Checklist manual)
1. **Conta de Developer na Chrome Web Store:** criar conta e pagar a taxa única de registo (5 USD) no Developer Dashboard.
2. **Email na Política de Privacidade:** editar `PRIVACY.md` e substituir `[YOUR EMAIL HERE]` pelo teu email de contacto/suporte, e alojar o ficheiro num URL público (ex.: GitHub).
3. **Screenshots (obrigatório: pelo menos 1, recomendado 2–3 em `1280x800` ou `640x400`, PNG/JPEG sem transparência):**
   - Carregar a extensão localmente em `chrome://extensions` → **Ativar Modo de programador** → **Carregar expandida** → selecionar a pasta `GTA6NOSPOILER`.
   - Tirar prints do **popup aberto** e do **YouTube com o overlay / modo blur** ativo (ex.: `1280x800`).
4. **Assets promocionais (já gerados em `store-assets/`):**
   - Small promo tile: `store-assets/promo-small-440x280.png`
   - Marquee promo tile (opcional): `store-assets/promo-marquee-1400x560.png`
5. **Submeter para revisão:** fazer upload do `dist/gta6-no-spoiler-1.0.0.zip`, preencher os campos acima e enviar para revisão da Google (normalmente 1–3 dias úteis).

