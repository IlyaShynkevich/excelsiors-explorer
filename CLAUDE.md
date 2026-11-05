# CLAUDE.md

## What this is
**Excelsiors Explorer**: university semester project (Agile / Design Thinking course), group of 3.
Mobile-first travel app demo for Berlin: explore sights, save places, check in for badges, book flights, hotels and taxis (comparing fictional providers), join meetups and group chats,
then see the whole trip in one timeline (change / cancel bookings, weather per day, simulated reminders and directions),
and on arrival check in where they are ("I'm here", simulated location, Near me, daily challenges with streaks).

## Architecture
- **React 18 + Vite**, plain JavaScript (no TypeScript), no UI libraries, no router library. Don't add any unless explicitly asked.
- `index.html`: page shell (meta tags incl. viewport `interactive-widget=resizes-content`, manifest + icon links, `#root`).
- `src/main.jsx`: imports the CSS, sets `--lego`, renders `<App>`, registers `sw.js` (production build, http/https only).
- `src/App.jsx`: renders the current screen (`ui.current`), tab bar, toast, bottom sheet, pull-to-refresh, offline banner;
  body classes `dark`, `is-offline`, `kb-open` (iOS keyboard, `--vvh/--vvt`).
- `src/screens/`: one file per screen. `src/components/`: shared pieces (AppBar/BackButton, TabBar, BottomSheet + `sheets/`,
  ChatBubble, Badge, Avatar/Pav/AvatarStack, MeetupCard/JoinButton, FilterChips (single or multi-select), Stepper, FieldMsg, PlaceTile,
  PlaceMeta/DietTags, PlaceMap (Leaflet), WeatherStrip, Toast, PullToRefresh, Photo (place photo: fades in once loaded, shimmer until then),
  ProviderList ("Compare providers" rows: Cheapest tag, "Save €X" line, optional "Show all")).
  Place photos are rendered with `<Photo p={p} [shade] [as="button"]>` (not `style={{background: bg(p)}}`).
- `src/data/`: demo data constants (`PLACES` incl. 8 food places, `PHOTOS`, `CATEGORIES`, `DIETS`, `INTERESTS`, weather `demoForecast`/`wmo`, `BADGES`, `FRIENDS`, `PEOPLE`, `MEETUPS` + seed chats, `REPLIES`,
  `CITIES`, `AIRLINES`, `RIDES`, `DRIVERS`, `COORDS`, `AVATARS`), the seeded flight generator and `taxiFare`.
  Stage 2 "Book": `FLIGHT_PROVIDERS` + `flightOffers(r, f)` (`data/booking.js`), `HOTELS` + `HOTEL_PROVIDERS` + `hotelOffers(h, s)` (`data/hotels.js`).
  Providers are **fictional** (made-up names, never real companies); offers are seeded (`seeded()`), so the same search shows the same prices.
  Hotels: real well-known Berlin hotels with Commons photos, plus 2 fictional ones (`fictional: true`, no photo). `stars: 0` = hostel (price per bed).
  Each hotel has `ll` [lat, lon]; `hotels.js` registers them as taxi spots `'ht-<id>'` in `COORDS`/`SPOT_LABEL` (`hotelSpot(h)`), so taxis and directions work from/to hotels.
  Stage 3: `kmBetween(a, b)` (straight line) and `directions(fromSpot, toSpot)` in `data/booking.js` (walk 5 km/h, transit 20 km/h + 8 min, both on km × 1.3; taxi = `taxiFare`).
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
  `createBooking/getBookings/getBooking/cancelBooking/updateBooking`, `getReminderSettings/setRemindersOn/setRemindersDemo/markRemindersRead`,
  `getLocation/saveLocation`, `getCheckins/addCheckin`, `getQuestLog/saveQuestDay`, `getDemoDays/setDemoDays`,
  plus `needsOnboarding/markOnboarded/saveInterests`, `persist()` and `checkUnlocks()`. Data lives in the `user` object, saved under `'ee_berlin'`; the session (email) under `'ee_session'`.
  Keep the keys and data shapes: old saved data (missing fields) must still load with defaults (`freshData()`, `cleanProfile()`).
- One account per browser. Its email needs the right password; any other email always falls back to the demo login (any password).
- `src/state/appStore.js`: unsaved UI state `ui` (screen, booking forms, sheet, toast …). Change `ui`/`user`, then call `emit()`;
  App re-renders through `useStore()`. Also `toast()`, `openSheet(kind, props)`, `closeSheet(silent)` and the badge unlock queue
  (unlock pop-ups wait until a booking confirmation sheet is closed).
- The profile has `interests` (ids from `INTERESTS`) and `onboarded`; `enterApp()` (router) shows `#interests` once after sign-in/sign-up.
- Bookings (flight, hotel, taxi) share one shape: `{type, ref, status ('Confirmed'|'Cancelled'), provider, price, cheapest, title, sub,
  start, end ('YYYY-MM-DDTHH:MM' local, for a later trip overview), created, details}`; `cleanBooking()` fills defaults for old saved bookings.
  `cheapest` = the cheapest offer in the list was booked (Smart Saver badge).
  `cancelBooking(ref, {refund, fee})` keeps the booking (status 'Cancelled', price 0) and stores `details.paid/refund/cancelFee`;
  `updateBooking(ref, changes)` changes provider/price/title/sub/start/end/details of a confirmed booking (`details.changes`, `details.changeFee`).
- Reminder settings live in `user.reminders = {on, demo, read: [ids]}` (`cleanReminders()` defaults for old data: on, not demo, none read).
- Stage 4: `user.location = {spot, real}` (spot = a `COORDS` key, default `'alex'`; the real position is never saved, only kept in
  `state/location.js` memory), `user.checkins = [{id (place id or 'ht-<hotel>'), date (demo date), t, first, kind}]` (last 500),
  `user.quests = {date: [completed quest ids]}`, `user.demoDays` (0–365). `cleanLocation/cleanCheckins/cleanQuests/cleanDays` fill defaults.
- Actions: `state/booking.js` (`setBookView`, `flightList`, `hotelList`, `bookFlight`, `bookHotel`, `requestTaxi`, `addBooking` → unlock queue), `state/meetups.js` (incl. chat + simulated replies), `state/achievements.js`,
  `state/explore.js` (search + filters in `ui.ex`, `exploreList()`), `state/weather.js` (Open-Meteo fetch, demo fallback, session-only),
  `state/trip.js` (Stage 3: `tripItems()/tripDays()` = bookings + joined meetups by day, hotels as check-in + check-out entries; `tripEntry(id)`;
  `changeQuote(b, v)`/`confirmChange` reuse the flight/hotel generators (same provider if it has an offer), change fee 25/15 € unless free cancellation;
  `cancelTerms(b)`/`confirmCancel`: free cancellation = full refund, non-refundable = only taxes & fees back, taxi free; `directionsStart()` = hotel of the current/next stay or Alexanderplatz),
  `state/reminders.js` (`dueReminders()` from the trip: flight −2 h, taxi −15 min, meetup −1 h, hotel −1 day; shown once due on the real clock, or all upcoming in demo mode; id includes the start time).
  `hooks/useClock.js` re-renders Home/Trip/Reminders every 30 s so reminders appear without navigation.
- Stage 4 "Arrive": `state/clock.js` (`appNow()/appToday()` = real time + demo days; used by challenges, streak, reminders; `nextDemoDay/resetDemoDate`),
  `state/location.js` (`here()` = demo spot or real position, `kmToSpot/distLabel/fmtDist` ("450 m", "1.2 km"), `isNearby` (300 m), `isAt` (150 m),
  `nearestPlaces(n, from)`, `setDemoSpot`, `setRealLocation` (geolocation only when switched on; denied/unavailable → demo + message),
  `initLocation()` on start (continues only if the permission is still granted, never prompts)),
  `state/challenges.js` (`checkIn(spot)`: once per spot and demo day, logs it, completes quests, `checkUnlocks()`, opens the `arrival` sheet,
  badges `queuePush`ed so they pop after it; `arrive(spot)` for "I've arrived"; `todaysQuests/streak/todayPoints/totalPoints/questHistory`).
  Data: `data/location.js` (`DEMO_SPOTS`, radii), `data/challenges.js` (13 `QUESTS`, `questsFor(date)` = seeded 3, `streakAt/bestStreak` …).
  Components: `HereAction` ("I'm here" / "You're about … away. Directions"), `Quests` (`QuestList`, `Streak`), `sheets/ArrivalSheet`.
  Directions now start at `here()` (Stage 3 started at the hotel); `trip.js currentHotel()` is the hotel for the "within 500 m of your hotel" quest.
- The signed-in user in meetups/chat/leaderboard is the `ME` object (`userData.js`); render avatars with `<AvatarImg>`/`avNode()`.
- Demo data stays in constants in `src/data/`; never put user data there.

## Routing
- Hash routes: `#login`, `#signup`, `#interests`, `#home`, `#explore`, `#book`, `#saved`, `#profile`, `#profile/edit`, `#achievements`,
  `#place/<id>`, `#meetups`, `#meetups/<placeId>`, `#meetup/<id>`, `#meetup/<id>/chat`,
  `#trip` (timeline), `#trip/<id>` (booking ref, or `m-<meetupId>` for a joined meetup; unknown id → `#trip`), `#reminders`, `#location` (Where am I?),
  Book steps: `#book/flights`, `#book/flights/results`, `#book/taxi`, `#book/hotels`, `#book/hotels/results`, `#book/hotel/<id>`
  (`#book/ride` and unknown steps open the hub). `setBookView(v)` pushes a step (`go('book', {keepView, push})`), `{replace:true}` after a booking.
  Search forms and filters live in unsaved `ui.fl`/`ui.ht`, so a reload shows the default search.
- `src/hooks/useHashRouter.js`: `go()`, `openDetail/openMeetups/openMeetup/openChat/openBooking/openTripItem`, `navIdx` + `canGoBack/goBack`
  (back buttons use browser back while there is app history), popstate handling. `go('explore', {cats})` opens Explore with category filters. Every `go()` bumps `ui.navSeq`, which remounts the screen.
- Only `login`/`signup` are reachable while logged out. The chat is only reachable for joined meetups.

## Images
- Logo, home background and Lego avatar are real files in `src/assets/` (they used to be base64 in the old file).
  **Never print, paste or rewrite base64 strings** (e.g. in `legacy/index.old.html`); use grep/scripts with offsets.
- Place photos are Wikimedia Commons URLs in `PHOTOS` (`src/data/places.js`).

## External services (no keys)
- Map: Leaflet (npm, dynamically imported, its own build chunk) + OpenStreetMap tiles; keep the OSM attribution. PlaceMap focuses the map
  itself with `preventScroll` on pointerdown (else Leaflet's focus scrolls a half-visible map and the pin tap is lost). Map classes are
  `.ex-map`/`.ex-pin` (`.map`/`.pin` belong to the taxi tracker), `.ex-me` = you-are-here dot (non-interactive). Offline → message + "Show list".
  The preview card stays mounted with `.closing` until it slid down. Leaflet's zoom (0.25 s) and tile fade (0.2 s) are timed inside leaflet.js
  (overriding the CSS would cut them off), so they keep Leaflet's values; `zoomAnimation/fadeAnimation/markerZoomAnimation` are off with reduced motion.
- Geolocation: `navigator.geolocation.watchPosition`, only after the user turns on "Use my real location"; no other permission prompts.
- Weather: Open-Meteo (`api.open-meteo.com`); on failure/offline the demo forecast is shown with a "Demo data" label.

## PWA
- `public/manifest.webmanifest`, `public/assets/*.png` icons, `public/sw.js` (cache `ee-v2`, network-first, offline fallback).
- Cross-origin requests (photos, tiles, weather) bypass the service worker. `vite.config.js` replaces `/* BUILD_FILES */[]` in `dist/sw.js` with the hashed build files; old caches and stale files are deleted on activate.

## Style
- Brand green `#0b7a2b`, max width 480px, iOS look; centred phone frame on desktop (min-width 601px).
- Text buttons (actions inside the app: Skip, Reset filters, Sign In, Show password …) are green `var(--accent)`, e.g. `.link-btn`,
  `.btn.ghost-link`, `.alt button`. `var(--link)` blue is only for real web links that leave the app (Wikipedia, map attribution).
  Use `<button>` for actions, never `<a>` without `href`.
- The toast sits below the top bar and the large-title row (`.toast` in `screens.css`), so it never covers a title.

## Motion
- Tokens in `base.css` `:root` (calmer timing, about 1.5x the first version): `--ease-out` (default), `--ease-in` (leaving), `--ease-in-out` (cross-fades),
  `--ease-spring` (pops), `--ease-spring-soft` (sheets, toast, bubbles), `--ease-nav` (screen slides: soft start), `--ease-pop` (badge: gentler bounce).
  Base durations `--dur-fast` 150ms (press feedback, chips) / `--dur-base` 350ms / `--dur-slow` 500ms, `--stagger` 60ms, `--press` (.97).
  Role durations: `--dur-nav` 480ms (slide forward/back), `--dur-tab` 300ms (tab cross-fade), `--dur-sheet-in` 450ms / `--dur-sheet-out` 350ms,
  `--dur-pop` 550ms (+ `--dur-pop-delay` 180ms), `--dur-photo` 400ms, `--dur-flip` 400ms (useFlip), `--dur-confetti` 1300ms, `--dur-toast` 350ms,
  `--dur-ride` 1s (taxi car step). Loops: `--dur-loop` 1.2s + `--loop-step` .2s (typing dots, weather pulse), `--dur-shimmer` 1.3s, `--dur-spin` .8s.
  Map preview card: `--dur-sheet-in`/`--dur-sheet-out` with `--ease-nav`; pins `--dur-slow` + `calc(var(--stagger) * var(--i))`.
  **New UI must reuse these tokens** (no raw durations or curves) and only animate `transform`/`opacity` (colours at most; never
  width/height/top/left, box-shadow or filter). Keep 150–550 ms (confetti 1.3 s); nothing may block taps.
  JS timers that wait for an animation read the tokens with `motionMs('sheet-out')` (`lib/motion.js`; 0 with reduced motion), never raw numbers.
  **No hard-coded animation durations**: no `ms`/`s` values, raw keyframe times or literal `setTimeout` delays for animations in CSS, inline styles or JS;
  add a token to `base.css :root` if none fits. (Non-animation timers are fine: toast hold time 1.8 s, simulated chat replies, taxi tick, weather timeout.)
- All animations live in `src/styles/motion.css` (imported last). Shared keyframes: `fade-in`, `fade-out`, `rise-in`.
  Lists: add `className="stagger"` to the container (first 8 children staggered). Filtered lists: `useFlip(scrollRef, selector, key)`.
- Screen transitions: `lib/motion.js`. `go()` calls `navStart(dir)` (a static copy of the old screen goes into `#navfx`), App calls
  `navPlay()` in a layout effect. Direction comes from `navDir()` in the router: tab↔tab = cross-fade, `fromHistory` = back/forward from
  `navIdx`, `goBack()` fallback = back, `replace` = fade, same screen = none. No transition on the first render (reload / deep link).
- Sheets: `BottomSheet` keeps the last sheet mounted with `.closing` until it slid out, then calls `sheetClosed()` (`appStore.js`):
  only then (plus a 60 ms pause) the next badge unlock in the queue opens, so a pop-up never cuts a closing sheet short.
  To show pop-ups after a sheet you close yourself, `queuePush()` them before/after `closeSheet()`.
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
