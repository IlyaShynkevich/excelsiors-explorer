# CLAUDE.md

## What this is
**Excelsiors Explorer**: university semester project (Agile / Design Thinking course), group of 3.
Mobile-first travel app demo for Berlin: explore sights, save places, check in for badges, book flights and taxis, join meetups and group chats.

## Architecture
- Everything is in ONE self-contained file: `index.html` (HTML + CSS + vanilla JS in an IIFE).
- No frameworks, no build step, no npm. Keep it that way unless explicitly asked otherwise.
- `assets/logo.png` is a source file only; `index.html` does not reference it.

## Images
- Logo, home background and profile picture are embedded as base64 data URIs.
  **Never print or rewrite those long strings**; edit around them (target lines with grep/offsets, not full-file reads).
- Place photos are Wikimedia Commons URLs in the `PHOTOS` object.

## Data and state
- Constants in the script: `PLACES`, `BADGES`, `FRIENDS`, `CITIES`, `RIDES`, `COORDS`, `PEOPLE`, `MEETUPS`, `REPLIES`, `AVATARS`.
- `MEETUPS` start times are computed relative to today (`at()`, `later()`), so demo meetups are always upcoming.
  `people[0]` is the host; `chat` holds seed messages that are copied into user state the first time the chat is opened.
- User state (saved, visited, unlocked badges, bookings, dark mode, joined meetup ids `joined`, user-created meetups `myMeetups`,
  chat messages per meetup id `chats`, `account` {email, pw hash, created}, `profile` {name, bio, city, avatar})
  persists in localStorage under `'ee_berlin'`. New fields get defaults when loading older data (`freshData()`, `cleanProfile()`).
- Login persists under `'ee_session'` (the signed-in email).
- **User data layer (EE-7):** screens never touch localStorage directly. Use the functions in the "User data" block:
  `getSession/setSession/clearSession`, `getUser/saveUser`, `signIn`, `signUp`, `getProfile/saveProfile`, `deleteUser`
  (and `store.get/set/del` for raw access). They are meant to be swapped for a real backend later.
- One account per browser. Its email needs the right password; any other email always falls back to the old demo login
  (any password). All logins in a browser share the same data and profile. The password is only a simple hash (demo, not secure).
- The user as shown in meetups/chat/leaderboard is the `ME` object (kept in sync by `syncMe()`); avatars are rendered by
  `avatarHTML(id)`. The Lego picture is reused through the CSS variable `--lego` (set from the profile `<img>` at startup).

## Routing
- Hash-based: `#login`, `#signup`, `#home`, `#explore`, `#book`, `#saved`, `#profile`, `#profile/edit` (screen `editProfile`), `#achievements`, `#place/<id>`,
  `#meetups` (or `#meetups/<placeId>` filtered to one place), `#meetup/<id>`, `#meetup/<id>/chat`.
- Handled by `go()` (hash built by `hashFor()`), `route()` and `history.pushState`.
- Only screens in `PUBLIC` (login, signup) are reachable while logged out; logged in, they redirect to home.
- The chat is only reachable for joined meetups; `openChat()` redirects others to the meetup page.
- Screens are `<section class="screen">` elements; bottom nav shows only on screens listed in `TABS`.

## Style
- CSS variables in `:root` and `body.dark`.
- Brand green `#0b7a2b`, max width 480px.
- Must work on phones: test at ~390px width, and at 320px.
- Inline form validation: `setMsg(id, msg, kind)` writes to the `#<id>Msg` element under a field and sets `aria-invalid`.

## Demo data
- Accounts/profiles (browser-only), login, flights, prices, taxis, friends, meetups and the group chat are all simulated (chat replies are canned `REPLIES`).
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
