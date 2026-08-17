---
name: bump-cache-version
description: Bump the ?v= cache-busting version across all layoutUpdate HTML files and shared.js before a deploy. Use whenever CSS/JS in public/layoutUpdate changed and the site is about to be deployed to Hostinger.
---

# Bump cache version

Browsers and Hostinger's edge cache aggressively cache every stylesheet and
script — `v3.css`, `v3-bridge.css`, `v3-instrument.css`, `v3.js`, `v3-data.js`,
`shared.js`, `live-data.js`, `chat-widget.js`. Every deploy MUST ship a new
`?v=` string or visitors see stale assets.

The `sed` below already covers all of them: it rewrites the token wherever it
appears, and every asset reference in every HTML file uses the same token.

## Steps

1. Find the current version (they are always all identical):

   ```bash
   grep -oh 'v=[0-9]\{8\}[a-z]' public/layoutUpdate/index.html | head -1
   ```

2. Compute the new version: today's date as `YYYYMMDD` + a letter suffix
   (`a` for the first deploy of the day, then `b`, `c`, …).

3. Replace in ALL HTML files AND shared.js (the chat-widget injector holds one):

   ```bash
   cd public/layoutUpdate
   OLD=v=20260816h NEW=v=$(date +%Y%m%d)a
   sed -i "s/$OLD/$NEW/g" *.html js/shared.js
   ```

4. Verify no old references remain and all files agree:

   ```bash
   grep -rho 'v=[0-9]\{8\}[a-z]' *.html js/shared.js | sort | uniq -c
   ```
   Exactly one distinct version must appear.

5. Remind the user the CLAUDE.md "Golden rules" and README deploy steps apply:
   upload the changed files to Hostinger `public_html/` and hard-refresh.
