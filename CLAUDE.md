# CLAUDE.md

## What this is
**Excelsiors Explorer**: university semester project (Agile / Design Thinking course), group of 3.
Mobile-first travel app demo for Berlin: explore sights, save places, check in for badges, book flights and taxis, join meetups and group chats.

## Architecture
- **React 18 + Vite**, plain JavaScript (no TypeScript), no UI libraries, no router library. Don't add any unless explicitly asked.
- `index.html`: page shell (meta tags incl. viewport `interactive-widget=resizes-content`, manifest + icon links, `#root`).
- `src/main.jsx`: imports the CSS, sets `--lego`, renders `<App>`, registers `sw.js` (production build, http/https only).
- `src/App.jsx`: renders the current screen (`ui.current`), tab bar, toast, bottom sheet, pull-to-refresh, offline banner;
  body classes `dark`, `is-offline`, `kb-open` (iOS keyboard, `--vvh/--vvt`).
- `src/screens/`: one file per screen. `src/components/`: shared pieces (AppBar/BackButton, TabBar, BottomSheet + `sheets/`,
  ChatBubble, Badge, Avatar/Pav/AvatarStack, MeetupCard/JoinButton, FilterChips, Stepper, FieldMsg, PlaceTile, Toast, PullToRefresh).
- `src/data/`: demo data constants (`PLACES`, `PHOTOS`, `BADGES`, `FRIENDS`, `PEOPLE`, `MEETUPS` + seed chats, `REPLIES`,
  `CITIES`, `AIRLINES`, `RIDES`, `DRIVERS`, `COORDS`, `AVATARS`), the seeded flight generator and `taxiFare`.
- `src/lib/format.js`: date/time/price helpers and `bg(place)` backgrounds.
- `src/styles/`: the CSS split by area, imported in order in `main.jsx` (order = cascade). `:root` tokens and `body.dark` rules live in `base.css`.
- `legacy/index.old.html`: the old single-file app, kept for comparison until parity is signed off. Not deployed.

## State
- `src/state/storage.js`: the **only** code that touches localStorage/sessionStorage (`store.get/set/del`, `lastRoute`).
- `src/state/userData.js`: the user data layer. **All user data goes through these named functions**:
  `getSession/setSession/clearSession`, `getUser/saveUser`, `signIn`, `signUp`, `getProfile/saveProfile`, `deleteUser`,
  plus `persist()` and `checkUnlocks()`. Data lives in the `user` object, saved under `'ee_berlin'`; the session (email) under `'ee_session'`.
  Keep the keys and data shapes: old saved data (missing fields) must still load with defaults (`freshData()`, `cleanProfile()`).
- One account per browser. Its email needs the right password; any other email always falls back to the demo login (any password).
- `src/state/appStore.js`: unsaved UI state `ui` (screen, booking forms, sheet, toast …). Change `ui`/`user`, then call `emit()`;
  App re-renders through `useStore()`. Also `toast()`, `openSheet(kind, props)`, `closeSheet(silent)` and the badge unlock queue
  (unlock pop-ups wait until a booking confirmation sheet is closed).
- Actions: `state/booking.js`, `state/meetups.js` (incl. chat + simulated replies), `state/achievements.js`.
- The signed-in user in meetups/chat/leaderboard is the `ME` object (`userData.js`); render avatars with `<AvatarImg>`/`avNode()`.
- Demo data stays in constants in `src/data/`; never put user data there.

## Routing
- Hash routes: `#login`, `#signup`, `#home`, `#explore`, `#book`, `#saved`, `#profile`, `#profile/edit`, `#achievements`,
  `#place/<id>`, `#meetups`, `#meetups/<placeId>`, `#meetup/<id>`, `#meetup/<id>/chat`.
- `src/hooks/useHashRouter.js`: `go()`, `openDetail/openMeetups/openMeetup/openChat/openBooking`, `navIdx` + `canGoBack/goBack`
  (back buttons use browser back while there is app history), popstate handling. Every `go()` bumps `ui.navSeq`, which remounts the screen.
- Only `login`/`signup` are reachable while logged out. The chat is only reachable for joined meetups.

## Images
- Logo, home background and Lego avatar are real files in `src/assets/` (they used to be base64 in the old file).
  **Never print, paste or rewrite base64 strings** (e.g. in `legacy/index.old.html`); use grep/scripts with offsets.
- Place photos are Wikimedia Commons URLs in `PHOTOS` (`src/data/places.js`).

## PWA
- `public/manifest.webmanifest`, `public/assets/*.png` icons, `public/sw.js` (cache `ee-v2`, network-first, offline fallback).
- `vite.config.js` replaces `/* BUILD_FILES */[]` in `dist/sw.js` with the hashed build files; old caches and stale files are deleted on activate.

## Style
- Brand green `#0b7a2b`, max width 480px, iOS look; centred phone frame on desktop (min-width 601px).
- Must work on phones: test at ~375/390px and at 320px (no horizontal overflow).

## Demo data
- Accounts/profiles (browser-only), login, flights, prices, taxis, friends, meetups and the group chat are all simulated. Keep the "demo" notes visible.

## Deployment
- GitHub repo `IlyaShynkevich/excelsiors-explorer`. Vercel auto-detects Vite (`npm run build` → `dist`) and deploys `main`:
  https://excelsiors-explorer.vercel.app/ — **pushing to `main` = going live.**

## Rules for changes
- Make focused edits; keep existing features and visible texts unchanged unless asked.
- **Never run git commands** (add, commit, push, pull, checkout …). The user handles all git.
  At the end of a task, list the changed files and suggest a commit message.
- Update `README.md` when features change.

## Checking your work
- `npm run build` must succeed (also catches syntax errors).
- `npm run preview` and check in a browser / Playwright at 375px and 320px, light and dark: screenshots of the changed screens,
  no console errors, no horizontal overflow, back button and hard reload on the changed routes.
- While `legacy/index.old.html` exists, screenshots can be compared against it (serve it with `public/` next to it).
