---
name: design-system
description: The v3 design system for public/layoutUpdate — tokens, tiers, the chart kit, motion, and the interaction rules (one scenario control per page, one menu open ever). Use whenever adding or restyling a page, component, or chart in the live site.
---

# AICIVSIM design system (v3)

The live site runs on one design system. **`design-system.html` is the
canonical, living spec** — it renders through the same CSS/JS as the
product, so read it in a browser before designing anything new. This
skill is the working summary plus the rules that are easy to break.

## Files

| File | Role |
|---|---|
| `css/v3.css` | Tokens + every component. The system. |
| `css/v3-bridge.css` | Translates the ORIGINAL design's vocabulary (`.page`, `.cell`, `.t1`–`.t4`, `--text-*`…) onto v3 tokens. For long-form docs written against the old stylesheet. |
| `css/v3-instrument.css` | HUD skin for the full-screen 3D instruments. |
| `js/v3.js` | Chrome (nav/deck/footer), scenario store, motion, chart kit, `V3.systemPage()`. |
| `js/v3-data.js` | Machine-extracted page data. **Regenerate, never hand-edit** (extractor in scratchpad; it executes the original pages' inline scripts in a VM). |
| `css/style.css` | **Retired.** Nothing should load it. |

motion.dev (pinned UMD, jsdelivr) loads **before** `v3.js` on every page.

## The three tiers

Every page is exactly one of:

1. **native** — `v3.css` + `v3.js`. All content pages. Call `V3.boot({deck:{…}})`.
2. **bridged** — `v3.css` + `v3-bridge.css` (+ `v3.js` for chrome). For
   documents whose markup uses the old vocabulary — `paper.html`.
3. **instrument** — own canvas UI + `v3-instrument.css` appended after the
   page's own `<style>`. `viz` · `explorer` · `xr` · `globe`. The 3D scenes
   are never restyled; only the HUD around them.

## Rules that are easy to break

- **One scenario control per page.** The four futures may be clickable in
  exactly ONE place. Pages hosting their own scenario instrument pass
  `deck:{…,noSeg:true}` to suppress the deck's segment (`pathways`).
  Pages where the scenario changes nothing on-screen also pass `noSeg`
  (`visualizer`, `data`, `research`, `about`, `design-system`, `paper`,
  `404`, `chat`). An inert control is worse than no control.
- **One menu open, ever.** Menu visibility is owned by a single state
  variable in `v3.js`. **Never** open a menu from CSS `:focus-within` —
  a clicked trigger keeps focus, so hover then opens a second menu and
  two show at once. (Shipped bug; the CSS carries a warning comment.)
- **The scenario control is the chart legend.** Charts never carry their
  own legend. Default scenario is always **BAU**; a user's choice persists
  sitewide via `aicivsim-scenario` + URL hash.
- **Charts: one geometry, six forms** — stat, trajectory (emphasis: active
  scenario bold + morphing, others ghosted), landing track, meter, slope,
  narrative panel. Scenario hues only on scenario identity; semantic
  green/red only on deltas and always with ▲▼ glyphs.
- **Motion confirms, never gates.** Springs attached to intent (press,
  switch, arrive). Content is always readable. `prefers-reduced-motion`
  collapses everything to instant.
- **Every metric carries its context.** A number without its "so what"
  isn't finished — charts take a `notes:{scenario:…}` map.

## Adding a page

```html
<link rel="stylesheet" href="css/v3.css?v=YYYYMMDDx">
…
<script src="js/shared.js?v=…"></script>
<script src="https://cdn.jsdelivr.net/npm/motion@12.23.26/dist/motion.js"></script>
<script src="js/v3.js?v=…"></script>
<script>V3.boot({deck:{sys:'climate',context:'…'}});</script>
```

A full system dashboard is a config object — see `V3.systemPage()` in
`js/v3.js` and any of the six system pages for the shape.

Then bump the cache token (`bump-cache-version` skill) and verify in a
real browser (`verify` skill).
