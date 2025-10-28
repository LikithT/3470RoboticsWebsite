<!-- .github/copilot-instructions.md: Guidance for AI coding agents working on this repository -->
# Copilot instructions — The Patriots 3470 (static site)

This repo is a small static website (single-page, full-screen sections) that uses `fullPage.js` and a local intro video. The README contains a separate, richer Next.js/3D project template — treat that as aspirational notes, not the canonical runtime for the files in this repository.

Key facts for edits
- Entry point: `index.html` — sections are implemented as `<div class="section" data-anchor="...">` and navigation uses FullPage.js.
- Client logic: `script.js` — instantiates `fullpage('#fullpage', {...})`. `fullpage_api` is a global used for programmatic navigation.
- Styles: `styles.css` — uses modern CSS (clamp(), grid, writing-mode vertical-rl). Fonts are loaded from Google Fonts (`Lora`).
- Large media: `DSC_0095.MOV` is embedded directly as the hero/background video — check file size before replacing or recommending commits.

What an AI agent should do first
- Prefer minimal, non-breaking edits. Open `index.html`, `script.js`, and `styles.css` together before making changes — behaviour spans all three files.
- If adding a UI section, follow the existing convention: add a new `.section` element with a unique `data-anchor`, place content inside `.content-wrapper`, and use the same classes (`.center-content`, `.side-text`) to inherit styles.

Important patterns & examples
- Section creation example:

```html
<!-- add below existing sections -->
<div class="section" data-anchor="new-section">
  <div class="content-wrapper">
    <div class="side-text left">LABEL</div>
    <div class="center-content"> ... </div>
    <div class="side-text right">LABEL</div>
  </div>
</div>
```

- Keyboard navigation mapping is explicit in `script.js` (Home -> section 1, End -> section 6). If you add or remove sections, update the `End` mapping or convert to dynamic logic.
- Video handling: the script attempts autoplay and re-play on `pause` events. When replacing the hero video, ensure new formats are compatible and keep `playsinline`/`muted` attributes to maximize autoplay success on mobile.

Developer workflows (project-specific)
- No build system detected — the app is runnable by opening `index.html` in a browser or by serving the folder (e.g., `python -m http.server` / `live-server`) for correct media loading.
- External deps are loaded from CDNs: FullPage.js and Google Fonts. Don't add breaking package-manager changes unless migrating the repo (note: README suggests a Next.js migration—ask before doing this).

Debugging tips
- Use browser DevTools to inspect `fullpage_api` (global) and confirm `new fullpage(...)` ran without errors.
- Video issues: check console messages in `script.js` (the code logs autoplay errors). Large `.MOV` files may not autoplay on all browsers — consider adding an MP4/WebM fallback.

Conventions & gotchas
- Styling: responsive units (`clamp`), `backdrop-filter` and `object-fit: cover` are used widely — preserve these when modifying layout.
- Accessibility: interactive anchors open external links with `target="_blank"` but no `rel="noopener"` — consider adding `rel="noopener"` when adding external links.
- README mismatch: the repo contains a static site while `README.md` documents an advanced Next.js/3D project; do not assume Next.js-only conventions in code changes unless the maintainer requests migration.

When merging with existing `.github/copilot-instructions.md`
- Preserve any project-specific commands or CLI steps. If an existing file exists, merge examples and keep the short-file explainers above.

When to ask the maintainer
- If you plan to add a build system (npm, bundler) or migrate to Next.js/Three.js as described in README.
- If you intend to replace the large video file or move media to a CDN/storage — ask about file size and hosting preferences.

If something is ambiguous, produce a short PR with one small change (example: add a new `.section` with placeholder content) and request feedback rather than making broad structural changes.

---
Files referenced: `index.html`, `script.js`, `styles.css`, `DSC_0095.MOV`, `README.md`

Please review and tell me if you want the file merged as-is or adjusted (tone, length, or more/less technical detail).
