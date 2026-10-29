<p align="center">
  <img src="assets/logo.png" width="140" alt="Excelsiors Explorer logo">
</p>

<h1 align="center">Excelsiors Explorer</h1>

<p align="center">
  <b>Booking app with travel guidance: discover Berlin, book flights and taxis, collect badges.</b><br>
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
| 🏠 **Home** | Greeting, search, popular sights, recently viewed, quick buttons for flights, taxis and meetups |
| 🔎 **Explore** | Live search across **19 Berlin places** with real photos, history, addresses, opening hours and prices |
| 📍 **Place details** | Check in, save the place, find a meetup there, or call a taxi straight to it |
| ✈️ **Flights** | Search flights to and from Berlin BER (14 European cities), choose passengers and class, get a booking reference |
| 🚕 **Taxi** | Pick-up and destination, Eco / Standard / XL with price estimate, schedule a ride or watch the driver arrive live |
| 🧾 **My bookings** | All flights and rides with their booking references |
| 👥 **Meetups** | Planned activities at Berlin sights with filters (All, Today, This week, Joined), join or leave, see who is going, and create your own meetup |
| 💬 **Group chat** | iOS-style chat for each meetup, only for people who joined; other travelers reply automatically (simulated) and messages are kept after a reload |
| 🔖 **Saved** | Your saved destinations |
| 🏅 **Achievements** | **17 badges** unlocked by checking in, booking and joining or hosting meetups, a friends leaderboard, side-by-side comparison and a "Flex it" share button |
| 👤 **Profile** | Edit your display name, a short bio (140 characters), home city and avatar (the Lego picture or 6 emoji avatars). Your name and avatar show up in meetups, the group chat and the leaderboard. Also recent destinations, achievements summary, dark mode, log out and **delete account** |

**Works like an app on the phone:** every screen has its own URL, so reload and the back button work as expected.
There is also pull-to-refresh, an offline banner, and you can install it via *Add to Home screen*.

**iOS-style design:** large titles, frosted top and tab bars, grouped settings lists and light/dark mode, tested on phones from 320 to 430 px wide.
On a laptop the app is shown inside a phone frame; on a real phone it runs full-screen.

> ⚠️ **Demo only.** Accounts and profiles are stored only in your browser (one account per browser, with one profile shared by every login there; don't use a real password). Login, flights, prices, drivers, friends, meetups and the group chat are simulated (there is no backend, nothing is sent to other people). No real bookings or payments are made.

## Try it

**Online:** <https://excelsiors-explorer.vercel.app/>

**Demo login:** any email (e.g. `test@test.com`) and any password.
Or tap **Create account** on the login page. The account's email then needs its password; any other email still uses the demo login.
Profile → **Delete Account** removes the account and everything saved in the browser.

**Tips for a demo**
- Profile → **Edit Profile** to pick an avatar, then join a meetup and write in its chat to see it there
- Open a place → **📍 Check in here** to unlock badges
- Book a flight to Berlin, then tap **🚕 Book a taxi from BER**
- Home → **👥 Meetups** → join one to unlock the group chat, or tap **+** to host your own
- Profile → Achievements → **Reset progress (demo)** to start over

## Tech stack

- **HTML, CSS and vanilla JavaScript** in one self-contained file (`index.html`), with no frameworks, dependencies or build step
- **localStorage** for the account, profile, login state, saved places, badges, bookings, meetups and chat messages (stored per browser)
- **Wikimedia Commons** photos loaded from each place's Wikipedia article
- **Vercel** hosting, which redeploys on every push to `main`

## Run locally

```bash
git clone https://github.com/IlyaShynkevich/excelsiors-explorer.git
cd excelsiors-explorer
```

Then open `index.html` in a browser. To test it on your phone over the same Wi-Fi,
use the VS Code **Live Server** extension and open `http://<your-laptop-ip>:5500` on the phone.

## 📁 Project structure

```
excelsiors-explorer/
├── index.html      # the whole app (markup, styles, logic, embedded images)
├── assets/
│   └── logo.png    # logo used in this README
├── README.md
└── .gitignore
```

## 👥 Team

| Name | Role |
|------|------|
| Ilya Shynkevich | Development |
| Nicolas Stechmann | Team Leader |
| Anant Raghavan | Development |

Planning in **Jira** (Kanban board) and design in **Miro**.

## Credits

- Place photos: [Wikimedia Commons](https://commons.wikimedia.org/), under free licences (see each file's page for author and licence)
- Place information is based on Wikipedia and official sources; opening hours and prices may change
- Taxi prices are rough estimates based on the Berlin taxi tariff
