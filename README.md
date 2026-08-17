# Garage Log

Personal bike maintenance and parts tracker. Static PWA — no build step, no backend.

- `index.html` — app shell, loads React/Babel from CDN
- `app.js` — the app itself
- `storage.js` — IndexedDB-backed storage (all data stays on-device)
- `manifest.json` / `service-worker.js` — makes it installable + offline-capable
- `icons/` — app icons

## Deploy

Push to GitHub, then import the repo in Vercel (vercel.com \u2192 Add New Project \u2192 import from GitHub).
No build command needed \u2014 framework preset "Other", output directory `.`.

## Updating

Any future changes just get committed and pushed \u2014 Vercel redeploys automatically.

## Data

All data is stored locally in the browser (IndexedDB) on whichever device installs the app.
There is no sync or cloud backup \u2014 use the Export backup button in the Profile tab periodically.
