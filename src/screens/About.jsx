import { AppBar } from '../components/AppBar.jsx';

// About this demo (Profile): the one place that explains what is simulated (the screens themselves stay free of demo notes)
const ITEMS = [
  ['Your account', 'Accounts, profiles and everything you save stay in this browser only. Any email and password work for a demo login.'],
  ['Bookings', 'Flights, hotels, taxis and prices are simulated. Booking sites are fictional. No payment is taken and no refund is real.'],
  ['People and chat', 'Meetups, travelers, friends and the group chat are simulated.'],
  ['Location', 'A demo location is used by default. Your real position is only used while the switch is on, and never saved or sent.'],
  ['Reminders and directions', 'Reminders appear inside the app only. Directions are estimates from the straight-line distance.'],
  ['Weather and maps', 'Live forecast from Open-Meteo (a demo forecast when offline). Map © OpenStreetMap contributors.'],
  ['Places', 'Photos from Wikimedia Commons (free licences). Opening hours, prices and dietary tags are indicative.'],
];

export function About() {
  return (
    <section className="screen active" id="about">
      <AppBar back="profile" title="About" />
      <div className="scroll">
        <h1 className="ltitle">About this demo</h1>
        <p className="about-lead">Excelsiors Explorer is a university demo app for Berlin. It looks real, but nothing is booked or charged.</p>
        <dl className="about-list">{ITEMS.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}</dl>
      </div>
    </section>
  );
}
