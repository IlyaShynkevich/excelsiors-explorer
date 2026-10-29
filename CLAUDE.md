# CLAUDE.md

## What this is
**Excelsiors Explorer**: university semester project (Agile / Design Thinking course), group of 3.
Mobile-first travel app demo for Berlin: explore sights, save places, check in for badges, book flights and taxis.

## Architecture
- Everything is in ONE self-contained file: `index.html` (HTML + CSS + vanilla JS in an IIFE).
- No frameworks, no build step, no npm. Keep it that way unless explicitly asked otherwise.
- `assets/logo.png` is a source file only; `index.html` does not reference it.

## Images
- Logo, home background and profile picture are embedded as base64 data URIs.
  **Never print or rewrite those long strings**; edit around them (target lines with grep/offsets, not full-file reads).
- Place photos are Wikimedia Commons URLs in the `PHOTOS` object.

## Data and state
- Constants in the script: `PLACES`, `BADGES`, `FRIENDS`, `CITIES`, `RIDES`, `COORDS`.
- User state (saved, visited, unlocked badges, bookings, dark mode) persists in localStorage under `'ee_berlin'`.
- Login persists under `'ee_session'`.

## Routing
- Hash-based: `#home`, `#explore`, `#book`, `#saved`, `#profile`, `#achievements`, `#place/<id>`.
- Handled by `go()`, `route()` and `history.pushState`.
- Screens are `<section class="screen">` elements; bottom nav shows only on screens listed in `TABS`.

## Style
- CSS variables in `:root` and `body.dark`.
- Brand green `#0b7a2b`, max width 480px.
- Must work on phones: test at ~390px width.

## Demo data
- Login, flights, prices, taxis and friends are all simulated.
- Keep the "demo" notes visible in the UI.

## Deployment
- GitHub repo: `IlyaShynkevich/excelsiors-explorer`.
- Vercel auto-deploys from `main`: https://excelsiors-explorer.vercel.app/
- **Pushing to `main` = going live.**

## Rules for changes
- Make focused edits; keep existing features working.
- After editing, check the JS for syntax errors (e.g. extract the `<script>` block and run `node --check`).
- Update `README.md` when features change.
- Never run git add, commit, push, pull or any other command that changes git state. The user handles all git.
  At the end of a task, list the changed files and suggest a commit message.
