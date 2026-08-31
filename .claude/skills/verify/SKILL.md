---
name: verify
description: Build/launch/drive recipe for verifying changes to the layoutUpdate static site in a real browser. Use after any change to public/layoutUpdate HTML/CSS/JS.
---

# Verify layoutUpdate changes

The live site is `public/layoutUpdate/` — vanilla HTML/JS, no build step.
Surface = browser pixels + console. Verify by serving and driving with
Playwright, not by unit-calling shared.js functions.

## Serve

```bash
cd public/layoutUpdate
python -m http.server 8080     # background it
```

## Drive (Playwright)

Playwright is NOT in any repo node_modules. Install into a scratch dir:

```bash
cd <scratch> && npm install playwright --no-save   # chromium already cached
```

Then a plain `node script.js` using `require('playwright')` from that dir.
Collect `page.on('console')` errors and `page.on('pageerror')` on every page.

## Known gotchas (environment, not bugs)

- **501 OPTIONS console error on every non-3D page**: chat-widget.js probes
  `api/chat.php` with an OPTIONS request; python http.server answers 501.
  Documented graceful degradation (PHP only works on Hostinger). Filter
  errors containing `501` before judging a page "clean".
- **Scroll-reveal race**: shared.js adds `.scroll-reveal` (opacity:0) to all
  `.cell`/`.pullquote`/`.chapter-divider`/`.section-num` ~50ms after load and
  reveals via IntersectionObserver. Content inside hidden tab sections stays
  opacity:0 until ~0.5–1s after the tab is shown. `waitForTimeout(1000)`
  before screenshots/visual assertions, or content will look blank while
  textContent checks still pass.
- Killing the server: `taskkill //F //IM python.exe` (Git Bash double-slash).

## Flows worth driving

- Target page(s): load, click every `.nav-tab`, switch every scenario button,
  assert zero (filtered) console errors.
- Cross-page scenario persistence: pick a scenario on one page, load another,
  check `localStorage['aicivsim-scenario']` and the bar's `aria-pressed`.
- Back-compat when shared.js changed: load viz.html (waits ~3s for three.js
  from jsdelivr; ignore CDN/net errors), ai.html (chart-heavy), and confirm
  chat widget present on content pages but absent on viz/explorer/xr.
- Theme: click `#theme-toggle`, screenshot `body.light`.
- Cache token invariant (after any deploy-bound change):
  `grep -rho 'v=[0-9]\{8\}[a-z]' *.html js/shared.js | sort | uniq -c`
  → exactly one distinct token.

## Scroll reveal shows nothing in a background tab

`V3.reveal()` is scheduled inside `requestAnimationFrame`, which browsers do
not run in a hidden tab. Driving a page through automation without
foregrounding it therefore reports **zero revealed elements on every page**,
including ones that are working correctly. It looks exactly like a site-wide
regression and is not one.

Check `document.visibilityState` before trusting any reveal measurement. A
screenshot forces a frame, so taking one and re-probing is a reliable way to
get a real reading.

