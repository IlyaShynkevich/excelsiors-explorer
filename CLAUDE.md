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
  ChatBubble, Badge, Avatar/Pav/AvatarStack, MeetupCard/JoinButton, FilterChips (single or multi-select), Stepper, FieldMsg, PlaceTile,
  PlaceMeta/DietTags, PlaceMap (Leaflet), WeatherStrip, Toast, PullToRefresh, Photo (place photo: fades in once loaded, shimmer until then)).
  Place photos are rendered with `<Photo p={p} [shade] [as="button"]>` (not `style={{background: bg(p)}}`).
- `src/data/`: demo data constants (`PLACES` incl. 8 food places, `PHOTOS`, `CATEGORIES`, `DIETS`, `INTERESTS`, weather `demoForecast`/`wmo`, `BADGES`, `FRIENDS`, `PEOPLE`, `MEETUPS` + seed chats, `REPLIES`,
  `CITIES`, `AIRLINES`, `RIDES`, `DRIVERS`, `COORDS`, `AVATARS`), the seeded flight generator and `taxiFare`.
- `src/lib/format.js`: date/time/price helpers and `bg(place)` backgrounds. `src/lib/hours.js`: `isOpenNow(place)` in Berlin time.
- Places: each gets `cats` (Explore categories), `tags` (interests), `oh` (weekly schedule string, `'24/7'` = always open, parsed into `week`)
  and `diet` (food only, indicative) from the `META` table in `places.js`. Coordinates for the map and taxi live in `COORDS` (`data/booking.js`).
  `wiki` is an English title, `'de:Title'` for German Wikipedia, or `''` (no link).
- `src/styles/`: the CSS split by area, imported in order in `main.jsx` (order = cascade). `:root` tokens and `body.dark` rules live in `base.css`.
- `legacy/index.old.html`: the old single-file app, kept for comparison until parity is signed off. Not deployed.

## State
- `src/state/storage.js`: the **only** code that touches localStorage/sessionStorage (`store.get/set/del`, `lastRoute`).
- `src/state/userData.js`: the user data layer. **All user data goes through these named functions**:
  `getSession/setSession/clearSession`, `getUser/saveUser`, `signIn`, `signUp`, `getProfile/saveProfile`, `deleteUser`,
  plus `needsOnboarding/markOnboarded/saveInterests`, `persist()` and `checkUnlocks()`. Data lives in the `user` object, saved under `'ee_berlin'`; the session (email) under `'ee_session'`.
  Keep the keys and data shapes: old saved data (missing fields) must still load with defaults (`freshData()`, `cleanProfile()`).
- One account per browser. Its email needs the right password; any other email always falls back to the demo login (any password).
- `src/state/appStore.js`: unsaved UI state `ui` (screen, booking forms, sheet, toast …). Change `ui`/`user`, then call `emit()`;
  App re-renders through `useStore()`. Also `toast()`, `openSheet(kind, props)`, `closeSheet(silent)` and the badge unlock queue
  (unlock pop-ups wait until a booking confirmation sheet is closed).
- The profile has `interests` (ids from `INTERESTS`) and `onboarded`; `enterApp()` (router) shows `#interests` once after sign-in/sign-up.
- Actions: `state/booking.js`, `state/meetups.js` (incl. chat + simulated replies), `state/achievements.js`,
  `state/explore.js` (search + filters in `ui.ex`, `exploreList()`), `state/weather.js` (Open-Meteo fetch, demo fallback, session-only).
- The signed-in user in meetups/chat/leaderboard is the `ME` object (`userData.js`); render avatars with `<AvatarImg>`/`avNode()`.
- Demo data stays in constants in `src/data/`; never put user data there.

## Routing
- Hash routes: `#login`, `#signup`, `#interests`, `#home`, `#explore`, `#book`, `#saved`, `#profile`, `#profile/edit`, `#achievements`,
  `#place/<id>`, `#meetups`, `#meetups/<placeId>`, `#meetup/<id>`, `#meetup/<id>/chat`.
- `src/hooks/useHashRouter.js`: `go()`, `openDetail/openMeetups/openMeetup/openChat/openBooking`, `navIdx` + `canGoBack/goBack`
  (back buttons use browser back while there is app history), popstate handling. `go('explore', {cats})` opens Explore with category filters. Every `go()` bumps `ui.navSeq`, which remounts the screen.
- Only `login`/`signup` are reachable while logged out. The chat is only reachable for joined meetups.

## Images
- Logo, home background and Lego avatar are real files in `src/assets/` (they used to be base64 in the old file).
  **Never print, paste or rewrite base64 strings** (e.g. in `legacy/index.old.html`); use grep/scripts with offsets.
- Place photos are Wikimedia Commons URLs in `PHOTOS` (`src/data/places.js`).

## External services (no keys)
- Map: Leaflet (npm, dynamically imported, its own build chunk) + OpenStreetMap tiles; keep the OSM attribution. Map classes are
  `.ex-map`/`.ex-pin` (`.map`/`.pin` belong to the taxi tracker). Offline → message + "Show list".
- Weather: Open-Meteo (`api.open-meteo.com`); on failure/offline the demo forecast is shown with a "Demo data" label.

## PWA
- `public/manifest.webmanifest`, `public/assets/*.png` icons, `public/sw.js` (cache `ee-v2`, network-first, offline fallback).
- Cross-origin requests (photos, tiles, weather) bypass the service worker. `vite.config.js` replaces `/* BUILD_FILES */[]` in `dist/sw.js` with the hashed build files; old caches and stale files are deleted on activate.

## Style
- Brand green `#0b7a2b`, max width 480px, iOS look; centred phone frame on desktop (min-width 601px).

## Motion
- Tokens in `base.css` `:root`: `--ease-out` (default), `--ease-in` (leaving), `--ease-in-out` (cross-fades), `--ease-spring` (pops),
  `--ease-spring-soft` (sheets, toast, bubbles), `--dur-fast` 150ms / `--dur-base` 250ms / `--dur-slow` 350ms, `--stagger` 30ms, `--press` (.97).
  **New UI must reuse these tokens** (no raw durations or curves) and only animate `transform`/`opacity` (colours at most; never
  width/height/top/left, box-shadow or filter). Keep 150–350 ms; nothing may block taps.
- All animations live in `src/styles/motion.css` (imported last). Shared keyframes: `fade-in`, `fade-out`, `rise-in`.
  Lists: add `className="stagger"` to the container (first 8 children staggered). Filtered lists: `useFlip(scrollRef, selector, key)`.
- Screen transitions: `lib/motion.js`. `go()` calls `navStart(dir)` (a static copy of the old screen goes into `#navfx`), App calls
  `navPlay()` in a layout effect. Direction comes from `navDir()` in the router: tab↔tab = cross-fade, `fromHistory` = back/forward from
  `navIdx`, `goBack()` fallback = back, `replace` = fade, same screen = none. No transition on the first render (reload / deep link).
- Sheets: `BottomSheet` keeps the last sheet mounted with `.closing` until it slid out; the unlock queue waits 280 ms after `closeSheet()`.
- Reduced motion (OS setting or `?motion=reduce` → `html.reduce-motion`): everything instant, no ghost/parallax/confetti/FLIP.
  JS checks `reducedMotion()` from `lib/motion.js`; the CSS block is at the end of `motion.css`.
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
- Mid-animation screenshots: pause with `document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; })`.
  Reduced motion: Playwright `reducedMotion: 'reduce'` or `?motion=reduce`.
- While `legacy/index.old.html` exists, screenshots can be compared against it (serve it with `public/` next to it).
