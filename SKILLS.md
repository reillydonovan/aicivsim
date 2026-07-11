# Project skills

Claude Code skills specific to this repo, in `.claude/skills/`. These encode
recipes that would otherwise have to be re-derived (or re-broken) every
session. Invoke with `/skill-name` or let Claude Code pick them up
automatically when the task matches.

## `bump-cache-version`

**Use when:** any CSS/JS under `public/layoutUpdate/` changed and the site
is about to be deployed to Hostinger.

`css/style.css`, `js/shared.js`, and `js/chat-widget.js` are all referenced
with a `?v=YYYYMMDDx` query string, and Hostinger's edge cache + browsers
cache them aggressively (30 days, per `.htaccess`). Every deploy that touches
one of those files must bump the version string in **every** HTML file plus
the `js/shared.js` chat-widget injector, or visitors see stale assets. The
skill finds the current token, computes the next one (today's date + next
letter suffix for same-day deploys), and does the find-and-replace.

## `verify`

**Use when:** after any change to `public/layoutUpdate` HTML/JS/CSS, before
calling it done.

This is a static site with no build step and no test suite — "verified"
means "opened in a real browser and driven." The skill documents:
- how to serve it (`python -m http.server 8080` from `public/layoutUpdate`)
- how to drive it (Playwright is not in any repo `node_modules` — install
  into a scratch dir with `npm install playwright --no-save`)
- two environment gotchas that look like bugs but aren't: the chat widget's
  `OPTIONS /api/chat.php` probe always 501s under `python -m http.server`
  (PHP only runs on Hostinger), and the sitewide scroll-reveal
  (`IntersectionObserver`-driven `.cell`/`.pullquote` fade-in) keeps content
  in newly-shown tabs at `opacity:0` for ~0.5–1s after the tab switches —
  wait before asserting or screenshotting.
- flows worth driving: full tab/scenario sweep on the changed page,
  cross-page scenario persistence via `localStorage['aicivsim-scenario']`,
  back-compat on `viz.html`/`xr.html` (they redeclare `grade()`/`scAt()`
  locally — shadowing, not sharing, `shared.js`) whenever `shared.js` itself
  changes, theme toggle, and the cache-token grep from the skill above.

## Adding a new skill

Skills live at `.claude/skills/<name>/SKILL.md`. Add an entry here summarizing
what it's for and when to reach for it — this file is the index, not a copy
of the skill content.
