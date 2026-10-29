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
| 🔐 **Login** | Demo sign-in that stays logged in after a reload |
| 🏠 **Home** | Greeting, search, popular sights, recently viewed, quick buttons for flights and taxis |
| 🔎 **Explore** | Live search across **19 Berlin places** with real photos, history, addresses, opening hours and prices |
| 📍 **Place details** | Check in, save the place, or call a taxi straight to it |
| ✈️ **Flights** | Search flights to and from Berlin BER (14 European cities), choose passengers and class, get a booking reference |
| 🚕 **Taxi** | Pick-up and destination, Eco / Standard / XL with price estimate, schedule a ride or watch the driver arrive live |
| 🧾 **My bookings** | All flights and rides with their booking references |
| 🔖 **Saved** | Your saved destinations |
| 🏅 **Achievements** | **15 badges** unlocked by checking in and booking, a friends leaderboard, side-by-side comparison and a "Flex it" share button |
| 👤 **Profile** | Avatar, recent destinations, achievements summary, dark mode, log out |

**Works like an app on the phone:** every screen has its own URL, so reload and the back button work as expected.
There is also pull-to-refresh, an offline banner, and you can install it via *Add to Home screen*.

> ⚠️ **Demo only.** Login, flights, prices, drivers and friends are simulated. No real bookings or payments are made.

## Try it

**Online:** <https://excelsiors-explorer.vercel.app/>

**Demo login:** any email (e.g. `test@test.com`) and any password.

**Tips for a demo**
- Open a place → **📍 Check in here** to unlock badges
- Book a flight to Berlin, then tap **🚕 Book a taxi from BER**
- Profile → Achievements → **Reset progress (demo)** to start over

## Tech stack

- **HTML, CSS and vanilla JavaScript** in one self-contained file (`index.html`), with no frameworks, dependencies or build step
- **localStorage** for login state, saved places, badges and bookings (stored per browser)
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
