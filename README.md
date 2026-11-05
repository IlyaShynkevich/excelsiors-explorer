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
grab a taxi to the next attraction and unlock badges for the places they visit.

The app was first designed as a clickable prototype on our Miro board, then implemented
as a working web app that runs in any phone browser.

## Features

| Area | What you can do |
|------|-----------------|
| 🔐 **Login & sign-up** | Create an account (name, email, password with at least 8 characters) with friendly inline validation, or use the demo sign-in; you stay logged in after a reload |
| 🏠 **Home** | Greeting, search, a **5-day Berlin weather forecast** (live from Open-Meteo; a labelled demo forecast if it can't load) with a "Rainy: try indoor places" hint that opens Explore filtered to museums, **For you** suggestions based on your interests, popular sights, recently viewed, quick buttons for flights, taxis and meetups |
| 🔎 **Explore** | Live search across **27 Berlin places** (19 sights + 8 well-known food places) with real photos, history, addresses, opening hours and prices. **Filters** (EE-43): categories (Sights, Museums, Parks, Food, Nightlife; pick several), **Open now** (checked against the current time in Berlin), and for Food a **Dietary** row (Vegan, Vegetarian, Halal, Gluten-free; a place must have all selected tags). An empty result offers *Reset filters* |
| 🗺️ **Map view** | List/Map toggle on Explore: an OpenStreetMap map with a pin for every filtered place. Tap a pin for a preview card with photo, category, open status and *View details* (also when the map is partly below the bottom of the screen). Without internet the map shows a friendly message and the list keeps working |
| ✨ **Interests** | After the first sign-up (and once on the first demo login) a "What do you like?" screen: pick at least 3 of History, Street art, Food, Nightlife, Nature, Museums, Architecture, Shopping, or skip. Change them any time in Edit Profile |
| 📍 **Place details** | Open now / closed now, dietary options for food places, check in, save the place, find a meetup there, or call a taxi straight to it |
| ✈️ **Flights** | Search flights to and from Berlin BER (14 European cities), choose passengers and class. **Compare providers** (Stage 2 "Book"): every flight is offered by 4–6 fictional booking sites at different prices and terms (checked bag included or not, free cancellation or not), cheapest first with a **Cheapest** tag and a "Save €X vs the most expensive" line. Sort the flights by *Cheapest*, *Fastest* or *Fewest stops*, filter by *Baggage included* and *Free cancellation*. The confirmation shows the provider and a price breakdown (base fare, taxes & fees, baggage). The same search always shows the same offers |
| 🏨 **Hotels** | Search by city, check-in/check-out and guests (only Berlin has hotels in the demo). **10 Berlin hotels and hostels** with photo, area, stars, description and amenities; each is offered by 3–5 fictional providers (breakfast or room only, free cancellation or non-refundable), with the same Cheapest tag and savings line. Sort by price or stars, filter *Under €120/night*, *4 stars and up*, *Free cancellation*, *Breakfast*. The confirmation shows nights × rate, taxes & fees (incl. Berlin City Tax) and the provider |
| 🚕 **Taxi** | Pick-up and destination, Eco / Standard / XL with price estimate, schedule a ride or watch the driver arrive live |
| 🧾 **My bookings** | All flights, hotel stays and rides with provider, price, status and booking reference. Each booking is saved with its type, provider, price, start and end date/time and a reference, ready for a later trip overview |
| 👥 **Meetups** | Planned activities at Berlin sights with filters (All, Today, This week, Joined), join or leave, see who is going, and create your own meetup |
| 💬 **Group chat** | iOS-style chat for each meetup, only for people who joined; other travelers reply automatically (simulated) and messages are kept after a reload |
| 🔖 **Saved** | Your saved destinations |
| 🏅 **Achievements** | **18 badges** unlocked by checking in, booking (incl. **Smart Saver**: book the cheapest provider for a flight or hotel) and joining or hosting meetups, a friends leaderboard, side-by-side comparison and a "Flex it" share button |
| 👤 **Profile** | Edit your display name, a short bio (140 characters), home city, interests and avatar (the Lego picture or 6 emoji avatars). Your name and avatar show up in meetups, the group chat and the leaderboard. Also recent destinations, achievements summary, dark mode, log out and **delete account** |

**Works like an app on the phone:** every screen has its own URL, so reload and the back button work as expected.
There is also pull-to-refresh, an offline banner, and you can install it via *Add to Home screen*.

**iOS-style design:** large titles, frosted top and tab bars, grouped settings lists and light/dark mode, tested on phones from 320 to 430 px wide.
Short, smooth animations throughout (see [Motion](#motion)), turned off with the system's *Reduce motion* setting.
On a laptop the app is shown inside a phone frame; on a real phone it runs full-screen.

> ⚠️ **Demo only.** Accounts and profiles are stored only in your browser (one account per browser, with one profile shared by every login there; don't use a real password). Login, flights, hotels, prices, drivers, friends, meetups and the group chat are simulated. **Opening hours and dietary tags are demo data**: the hours are simplified weekly schedules, and the dietary tags of the food places are indicative only (always check with the venue). If the live weather can't be loaded, the forecast shown is demo data and is labelled as such (there is no backend, nothing is sent to other people). **Booking providers and their prices are demo data**: the provider names (TicketBär, Spree Fares, BettBörse, Kiez Stays …) are made up, the prices are simulated ("demo prices"), and no real provider is contacted. The hotels are real, well-known Berlin hotels except *Spreeblick Hotel* and *Pension Kastanie*, which are fictional. No real bookings or payments are made.

## Try it

**Online:** <https://excelsiors-explorer.vercel.app/>

**Demo login:** any email (e.g. `test@test.com`) and any password.
Or tap **Create account** on the login page. The account's email then needs its password; any other email still uses the demo login.
Profile → **Delete Account** removes the account and everything saved in the browser.

**Tips for a demo**
- Profile → **Edit Profile** to pick an avatar, then join a meetup and write in its chat to see it there
- Explore → tap **Food** and then **Vegan** + **Gluten-free**, or switch to **🗺️ Map** and tap a pin
- Open a place → **📍 Check in here** to unlock badges
- Book a flight to Berlin from the **cheapest provider** (Smart Saver badge), then tap **🚕 Book a taxi from BER**
- Book → Hotels: compare providers for a Berlin hotel, try the filters and the *Stars* sort
- Home → **👥 Meetups** → join one to unlock the group chat, or tap **+** to host your own
- Profile → Achievements → **Reset progress (demo)** to start over

## Tech stack

- **React 18 + Vite**, plain JavaScript (no TypeScript, no UI or router library); hash routing in a small custom hook
- **CSS** in `src/styles/` (iOS-style design tokens, light and dark mode)
- **localStorage** for the account, profile, login state, saved places, badges, bookings, meetups and chat messages (stored per browser)
- **PWA**: web app manifest and a network-first service worker, so the app can be installed and opens offline
- **Wikimedia Commons** photos loaded from each place's Wikipedia article
- **[Leaflet](https://leafletjs.com/)** (npm, loaded only when the map opens) with **[OpenStreetMap](https://www.openstreetmap.org/copyright)** tiles for the map view, no API key
- **[Open-Meteo](https://open-meteo.com/)** free weather API (no key) for the 5-day Berlin forecast
- **Vercel** hosting: Vercel detects Vite, runs `npm run build` and serves `dist/`, with no extra config. Every push to `main` goes live

## Motion

Small iOS-style animations that never get in the way (150–350 ms, only `transform` and `opacity`, pure CSS, no animation library):

- **Screens:** going forward slides the new screen in from the right while the old one moves slightly to the left (parallax); the back button or browser back slides it out to the right. Switching tabs is a short cross-fade. Reload and deep links open without an animation.
- **Sheets and pop-ups:** bottom sheets slide up with a soft spring over a fading backdrop and slide out again when closed. A new badge pops in with a small bounce and a light confetti burst (it still waits until a booking sheet has closed).
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
│   ├── hooks/               # useHashRouter (routes + back button), useFieldMessages (form validation), useFlip (list animation)
│   ├── components/          # app bar, tab bar, bottom sheets, chat bubble, badge, avatars, cards, chips …
│   ├── screens/             # one file per screen: Login, SignUp, Interests, Home, Explore, PlaceDetail, Saved, Profile,
│   │                        #   EditProfile, Achievements, Book, Meetups, MeetupDetail, MeetupChat
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
