# Open Graph cards

Four hand-authored SVG source files, one per scenario. They are **not** the
files crawlers fetch — see below.

| File | Scenario | 2050 composite |
|---|---|---|
| `aicivsim-aggressive.svg` | Aggressive action | 85 |
| `aicivsim-moderate.svg` | Moderate reform | 63 |
| `aicivsim-bau.svg` | Business as usual | 28 |
| `aicivsim-worst.svg` | Worst case | 11 |

## Why they are not live yet

Crawlers (Facebook, LinkedIn, Slack, X) do **not** accept SVG for `og:image`.
They need PNG or JPEG. Until the conversion below is run and the PNGs are
uploaded, every page's `og:image` points at `favicon.svg`, which is a
deliberate placeholder rather than a broken reference.

## Converting to PNG

Run one of these from this directory. Both produce `aicivsim-<scenario>.png`
at 1200×630, the standard OG size.

**rsvg-convert** (sharpest text, needs librsvg):

```bash
for f in aicivsim-*.svg; do
  rsvg-convert -w 1200 -h 630 "$f" -o "${f%.svg}.png"
done
```

**sharp-cli** (Node, no system deps):

```bash
npx sharp-cli -i "aicivsim-*.svg" -o . resize 1200 630 --format png
```

**Fonts.** The cards reference Space Grotesk and JetBrains Mono with generic
fallbacks. If those families are not installed on the converting machine the
PNGs render in the fallback face, which is legible but off-brand. Install both
first, or convert on a machine that already has them.

## After converting

1. Upload the four PNGs to `public_html/og/`.
2. Point each page's `og:image` at the right card. Pages whose content is
   scenario-dependent should use the `?sc=` share URL form, because a URL
   fragment (`#bau`) never reaches the crawler — a hash-only link would always
   serve the same card regardless of which future the sender was viewing.
3. Re-scrape with the platform debuggers; all of them cache aggressively.

## Editing

`scratchpad/og-cards.py` in the session that produced these regenerates all
four from the scenario table. Editing the SVGs by hand is fine for one-offs;
regenerate if the scenario colours or 2050 projections change, so the cards
cannot drift from `V3.SC`.
