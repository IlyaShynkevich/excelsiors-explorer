<p align="center">
  <img src="assets/logo.png" width="140" alt="Excelsiors Explorer logo">
</p>

<h1 align="center">Excelsiors Explorer</h1>

<p align="center">
  <b>Booking app with travel guidance: discover Berlin, compare and book flights, hotels and taxis, collect badges.</b><br>
  A mobile-first web app built for our Agile / Design Thinking semester project.
</p>

<p align="center">
  <a href="https://excelsiors-explorer.vercel.app/"><b>▶ Open the live demo</b></a>
</p>

---

## About

Excelsiors Explorer helps travellers explore a city and plan their trip in one place.
Our demo city is **Berlin**: users browse real sights, save favourites, book a flight to BER,
grab a taxi to the next attraction, see their whole trip day by day, check in when they arrive and unlock badges and daily challenges.

The app was first designed as a clickable prototype on our Miro board, then implemented
as a working web app that runs in any phone browser.

## Features

| Area | What you can do |
|------|-----------------|
| 🔐 **Login & sign-up** | Create an account (name, email, password with at least 8 characters) with friendly inline validation, or use the demo sign-in; you stay logged in after a reload |
| 🏠 **Home** | Greeting, search, a **5-day Berlin weather forecast** (live from Open-Meteo; a labelled demo forecast if it can't load) with a "Rainy: try indoor places" hint that opens Explore filtered to museums, **For you** suggestions based on your interests, popular sights, recently viewed, quick buttons for flights, taxis and meetups. Also **Today's challenges** with your 🔥 streak and a **Near you** row with the 3 closest places |
| 🔎 **Explore** | Live search across **27 Berlin places** (19 sights + 8 well-known food places) with real photos, history, addresses, opening hours and prices. **Filters** (EE-43): categories (Sights, Museums, Parks, Food, Nightlife; pick several), **Open now** (checked against the current time in Berlin), and for Food a **Dietary** row (Vegan, Vegetarian, Halal, Gluten-free; a place must have all selected tags). An empty result offers *Reset filters*. **Near me** (EE-18): sort by distance from your location; every card shows the distance (e.g. "450 m") and places within 300 m get a **Nearby** tag |
| 📡 **Where am I?** (Stage 4) | Your location, from the top of Explore or from Profile. By default a **demo location**: pick one of 10 central Berlin spots (Alexanderplatz, sights and hotels); the choice is saved. Or switch on **Use my real location**: only then the browser asks for permission; if you deny it or it isn't available, the app goes back to the demo location with a friendly message. Your real position is never saved. All distances, *Near me*, *I'm here* and directions use this location |
| 🗺️ **Map view** | List/Map toggle on Explore: an OpenStreetMap map with a pin for every filtered place. Tap a pin for a preview card with photo, category, open status, distance and *View details*; a blue dot shows where you are (also when the map is partly below the bottom of the screen). Without internet the map shows a friendly message and the list keeps working |
| ✨ **Interests** | After the first sign-up (and once on the first demo login) a "What do you like?" screen: pick at least 3 of History, Street art, Food, Nightlife, Nature, Museums, Architecture, Shopping, or skip. Change them any time in Edit Profile |
| 📍 **Place details** | Open now / closed now, distance from you, dietary options for food places, save the place, find a meetup there, get **directions** or call a taxi straight to it |
| 🛬 **Arrive** (Stage 4) | **I'm here** checks you in when you are within 150 m of a place (or a hotel); further away it says "You're about 1.2 km away" with *Directions* (and *Put me here (demo)* with a demo location). After a check-in an **arrival sheet** shows "You arrived at …", a short fact, your joined meetup there today, the challenges you just completed and three places nearby. In a taxi booking of My Trip, **I've arrived** moves your demo location to the destination and shows the same sheet |
| 🎯 **Daily challenges** (Stage 4) | 3 quests a day from a pool of 13 (e.g. *Visit a historic landmark*, *Try a food place*, *Check in at 2 places today*, *Visit a place within 500 m of your hotel*, *Check in at a museum / park*). Check-ins complete them automatically; each gives points, with a progress bar and a points total. The 🔥 **streak** counts the days in a row with at least one completed challenge (Home card and Achievements → *Challenges*). Profile → **Demo: simulate next day** moves the app's date forward (saved, with a reset) for challenges, streak and reminders |
| ✈️ **Flights** | Search flights to and from Berlin BER (14 European cities), choose passengers and class. **Compare providers** (Stage 2 "Book"): every flight is offered by 4–6 fictional booking sites at different prices and terms (checked bag included or not, free cancellation or not), cheapest first with a **Cheapest** tag and a "Save €X vs the most expensive" line. Sort the flights by *Cheapest*, *Fastest* or *Fewest stops*, filter by *Baggage included* and *Free cancellation*. The confirmation shows the provider and a price breakdown (base fare, taxes & fees, baggage). The same search always shows the same offers |
| 🏨 **Hotels** | Search by city, check-in/check-out and guests (only Berlin has hotels in the demo). **10 Berlin hotels and hostels** with photo, area, stars, description and amenities; each is offered by 3–5 fictional providers (breakfast or room only, free cancellation or non-refundable), with the same Cheapest tag and savings line. Sort by price or stars, filter *Under €120/night*, *4 stars and up*, *Free cancellation*, *Breakfast*. The confirmation shows nights × rate, taxes & fees (incl. Berlin City Tax) and the provider |
| 🚕 **Taxi** | Pick-up and destination, Eco / Standard / XL with price estimate, schedule a ride or watch the driver arrive live |
| 🧾 **My bookings** | All flights, hotel stays and rides with provider, price, status and booking reference; tap one to open it in the trip overview (cancelled bookings are shown muted) |
| 🧳 **My Trip** (Stage 3, EE-38) | One **timeline** of all flights, hotel stays (check-in and check-out), taxis and joined meetups, grouped by day, with time, provider or place, status and an icon per type. Each day shows the **Berlin forecast** when it is within the 5-day window (otherwise "Forecast available closer to the trip") and on rainy days (≥ 60 %) a "Rainy: try indoor places" link to museums. Open from Home, Profile or My bookings; empty state with shortcuts to Explore and Book |
| ✏️ **Change or cancel** | A booking's detail shows its reference, route or address, provider, price and status. **Change booking**: another day (flight), other dates (hotel) or another time (taxi), with the new demo price, a change fee for non-flexible offers and the price difference before you confirm. **Cancel booking**: the refund terms of the booked offer (free cancellation = full refund, non-refundable = only taxes & fees back, taxis free); afterwards it shows as *Cancelled* everywhere |
| 🔔 **Reminders** (simulated) | A bell on Home with an in-app list: flight 2 hours before, taxi 15 minutes before, meetup 1 hour before, hotel check-in the day before, shown once that time has come. Mark as read, turn them off in Profile, or use **Demo: show reminders now** to see all upcoming ones at once. No push notifications, no permission request |
| 🧭 **Directions** (simulated) | From a place, a hotel booking or a meetup: walking time (5 km/h), public transport estimate (U-Bahn / S-Bahn / bus, demo) and taxi fare, starting at your hotel (or Alexanderplatz), with the distance in km and "Get a taxi here" |
| 👥 **Meetups** | Planned activities at Berlin sights with filters (All, Today, This week, Joined), join or leave, see who is going, and create your own meetup |
| 💬 **Group chat** | iOS-style chat for each meetup, only for people who joined; other travelers reply automatically (simulated) and messages are kept after a reload |
| 🔖 **Saved** | Your saved destinations |
| 🏅 **Achievements** | **21 badges** unlocked by checking in, booking (incl. **Smart Saver**: book the cheapest provider for a flight or hotel), joining or hosting meetups and the daily challenges (**On a Roll**: 3-day streak, **Quest Master**: all 3 challenges in one day, **Hotel Hopper**: check in at two different hotels on the same day, an idea from one of our interviews), a friends leaderboard, side-by-side comparison and a "Flex it" share button |
| 👤 **Profile** | Edit your display name, a short bio (140 characters), home city, interests and avatar (the Lego picture or 6 emoji avatars). Your name and avatar show up in meetups, the group chat and the leaderboard. Also recent destinations, achievements summary, dark mode, log out and **delete account** |

**Works like an app on the phone:** every screen has its own URL, so reload and the back button work as expected.
There is also pull-to-refresh, an offline banner, and you can install it via *Add to Home screen*.

**iOS-style design:** large titles, frosted top and tab bars, grouped settings lists and light/dark mode, tested on phones from 320 to 430 px wide.
Short, smooth animations throughout (see [Motion](#motion)), turned off with the system's *Reduce motion* setting.
On a laptop the app is shown inside a phone frame; on a real phone it runs full-screen.

> ⚠️ **Demo only.** Accounts and profiles are stored only in your browser (one account per browser, with one profile shared by every login there; don't use a real password). Login, flights, hotels, prices, drivers, friends, meetups, the group chat, trip reminders, directions, the demo location and the daily challenges are simulated (reminders only appear inside the app; directions are estimates from the straight-line distance, not real routes). **Opening hours and dietary tags are demo data**: the hours are simplified weekly schedules, and the dietary tags of the food places are indicative only (always check with the venue). If the live weather can't be loaded, the forecast shown is demo data and is labelled as such (there is no backend, nothing is sent to other people). **Booking providers and their prices are demo data**: the provider names (TicketBär, Spree Fares, BettBörse, Kiez Stays …) are made up, the prices are simulated ("demo prices"), and no real provider is contacted. The hotels are real, well-known Berlin hotels except *Spreeblick Hotel* and *Pension Kastanie*, which are fictional. No real bookings or payments are made.

## Try it

**Online:** <https://excelsiors-explorer.vercel.app/>

**Demo login:** any email (e.g. `test@test.com`) and any password.
Or tap **Create account** on the login page. The account's email then needs its password; any other email still uses the demo login.
Profile → **Delete Account** removes the account and everything saved in the browser.

**Tips for a demo**
- Profile → **Edit Profile** to pick an avatar, then join a meetup and write in its chat to see it there
- Explore → tap **Food** and then **Vegan** + **Gluten-free**, or switch to **🗺️ Map** and tap a pin
- Explore → **📡 Where am I?** → pick *Brandenburg Gate*, then sort by **Near me** and open the gate → **📍 I'm here** (arrival sheet, challenges, badges)
- Home → **Today's challenges**: complete all 3, then Profile → **Demo: simulate next day** twice to build a 3-day 🔥 streak (*On a Roll*)
- Book → Hotels → open a hotel → *Put me here (demo)* → **I'm here**, then the same at a second hotel (*Hotel Hopper*)
- My Trip → a taxi booking → **I've arrived**
- Book a flight to Berlin from the **cheapest provider** (Smart Saver badge), then tap **🚕 Book a taxi from BER**
- Book → Hotels: compare providers for a Berlin hotel, try the filters and the *Stars* sort
- Home → **👥 Meetups** → join one to unlock the group chat, or tap **+** to host your own
- Book a flight, a hotel and a taxi and join a meetup, then Home → **🧳 My Trip**: open a booking to **change** or **cancel** it
- Profile → **Demo: show reminders now**, then tap the 🔔 bell on Home
- Open a place or your hotel booking → **🧭 Directions**
- Profile → Achievements → **Reset progress (demo)** to start over

## Tech stack

- **React 18 + Vite**, plain JavaScript (no TypeScript, no UI or router library); hash routing in a small custom hook
- **CSS** in `src/styles/` (iOS-style design tokens, light and dark mode)
- **localStorage** for the account, profile, login state, saved places, badges, bookings, meetups, chat messages, reminder settings, demo location, check-ins, challenges and the demo date (stored per browser; never the real position)
- **PWA**: web app manifest and a network-first service worker, so the app can be installed and opens offline
- **Wikimedia Commons** photos loaded from each place's Wikipedia article
- **[Leaflet](https://leafletjs.com/)** (npm, loaded only when the map opens) with **[OpenStreetMap](https://www.openstreetmap.org/copyright)** tiles for the map view, no API key
- **[Open-Meteo](https://open-meteo.com/)** free weather API (no key) for the 5-day Berlin forecast
- **Vercel** hosting: Vercel detects Vite, runs `npm run build` and serves `dist/`, with no extra config. Every push to `main` goes live

## Motion

Calm iOS-style animations that never get in the way (only `transform` and `opacity`, pure CSS, no animation library). All timings are shared design tokens in `src/styles/base.css`; taps always work immediately, even in the middle of a transition:

| What | Duration | Token |
|------|----------|-------|
| Screen slide forward / back (soft ease-out) | 480 ms | `--dur-nav`, `--ease-nav` |
| Tab cross-fade | 300 ms | `--dur-tab` |
| Bottom sheet in / out | 450 ms / 350 ms | `--dur-sheet-in`, `--dur-sheet-out` |
| Badge pop-up (gentle bounce, after 180 ms) | 550 ms | `--dur-pop`, `--ease-pop` |
| Press feedback (kept quick) | 150 ms | `--dur-fast` |
| List items one after the other | 60 ms per item | `--stagger` |
| Photo fade-in · filtered list glide | 400 ms | `--dur-photo`, `--dur-flip` |
| Confetti | 1.3 s | `--dur-confetti` |
| Toast in / out | 350 ms | `--dur-toast` |
| Map pin preview: slide up / down (soft ease-out) | 450 ms / 350 ms | `--dur-sheet-in`, `--dur-sheet-out`, `--ease-nav` |
| Map pins drop in one after the other · tapped pin grows | 500 ms · 350 ms | `--dur-slow`, `--stagger`, `--dur-base` |
| Taxi tracker car step | 1 s | `--dur-ride` |
| Loading loops (typing dots, weather, shimmer, spinner) | 1.2 s / 1.3 s / 0.8 s | `--dur-loop`, `--dur-shimmer`, `--dur-spin` |
| Other fades and pops | 350 / 500 ms | `--dur-base`, `--dur-slow` |

No animation has a hard-coded duration; only Leaflet's own map zoom (0.25 s) and tile fade (0.2 s) keep Leaflet's built-in timing, and they are turned off with *Reduce motion*.


- **Screens:** going forward slides the new screen in from the right while the old one moves slightly to the left (parallax); the back button or browser back slides it out to the right. Switching tabs is a cross-fade. Reload and deep links open without an animation.
- **Sheets and pop-ups:** bottom sheets slide up with a soft spring over a fading backdrop and slide out again when closed. A new badge pops in with a small bounce and a light confetti burst (it waits until a booking sheet has completely slid out).
- **Feedback:** buttons and cards shrink slightly while pressed, *Save* and *Check in* pop with a check mark, chips and toggles animate their state, and messages ("toasts") slide in just below the top bar and the large title, so they never cover either.
- **Lists and photos:** places, meetups, bookings, flights, hotels and badges fade and rise in one after the other (the first 8). Photos fade in once loaded, with a soft shimmer until then. Changing a filter lets the list glide to its new layout instead of jumping.
- **Chat, map and more:** new chat messages pop in from the sender's side, map pins drop in, the pin preview slides up, the active tab icon pops, badge progress bars fill up and the weather days fade in.

**Reduced motion:** with *Reduce motion* turned on in the phone or computer settings, everything changes instantly: no sliding, parallax or confetti (only the chat's typing dots still pulse softly). To try it without changing your settings, open the app with `?motion=reduce`, e.g. <https://excelsiors-explorer.vercel.app/?motion=reduce>, or in Chrome DevTools use *Rendering → Emulate CSS media feature prefers-reduced-motion*.

## Run locally

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
git clone https://github.com/IlyaShynkevich/excelsiors-explorer.git
cd excelsiors-explorer
npm install        # once
npm run dev        # dev server with hot reload: http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build: http://localhost:4173
```

To test on your phone over the same Wi-Fi, run `npm run dev -- --host` and open the *Network* address it prints.
The service worker (install / offline) is only registered in the production build (`npm run build` + `npm run preview`).

## 📁 Project structure

```
excelsiors-explorer/
├── index.html               # page shell: meta tags, manifest and icon links, #root
├── vite.config.js           # React plugin; writes the list of built files into dist/sw.js
├── package.json
├── public/                  # copied as-is into dist/
│   ├── manifest.webmanifest
│   ├── sw.js                # service worker (cache 'ee-v2', network-first)
│   └── assets/              # favicon, apple-touch-icon, app icons
├── src/
│   ├── main.jsx             # entry: styles, React root, service worker registration
│   ├── App.jsx              # shell: current screen, tab bar, toast, bottom sheet, theme, offline, keyboard
│   ├── assets/              # logo, home background, Lego avatar picture
│   ├── data/                # demo data: places + photos, badges + friends, meetups + chats, flights/taxi + providers, hotels, avatars
│   ├── state/               # user data layer (the only code using localStorage), UI store, app actions
│   ├── hooks/               # useHashRouter (routes + back button), useFieldMessages (form validation), useFlip (list animation), useClock
│   ├── components/          # app bar, tab bar, bottom sheets, chat bubble, badge, avatars, cards, chips …
│   ├── screens/             # one file per screen: Login, SignUp, Interests, Home, Explore, PlaceDetail, Saved, Profile,
│   │                        #   EditProfile, Achievements, Book, Meetups, MeetupDetail, MeetupChat, Trip (+ detail), Reminders, Location
│   ├── lib/                 # format.js (dates, times, prices), hours.js ("open now" in Berlin time), motion.js (screen transitions)
│   └── styles/              # the CSS, split by area (motion.css: all animations)
├── legacy/index.old.html    # the previous single-file version, kept until the migration is signed off
├── assets/logo.png          # logo used in this README
└── README.md
```

## 👥 Team

| Name | Role |
|------|------|
| Ilya Shynkevich | Development |
| Nicolas Stechmann | Team Leader |
| Anant Raghavan | Development |

Planning in **Jira** (Kanban board) and design in **Miro**.

## Credits

- Place and hotel photos: [Wikimedia Commons](https://commons.wikimedia.org/), under free licences (see each file's page for author and licence)
- Place information is based on Wikipedia and official sources; opening hours and prices may change
- Taxi prices are rough estimates based on the Berlin taxi tariff
- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, map library [Leaflet](https://leafletjs.com/)
- Weather data by [Open-Meteo.com](https://open-meteo.com/) (CC BY 4.0)
