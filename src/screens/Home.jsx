import { Plane, CarTaxiFront, Users, Flame, MapPin, ChevronRight, CalendarPlus } from 'lucide-react';
import { ui, emit, closeSheet } from '../state/appStore.js';
import { getProfile } from '../state/userData.js';
import { go, openBooking, openMeetups, openTripItem } from '../hooks/useHashRouter.js';
import { AvatarImg } from '../components/Avatar.jsx';
import { PlaceTile } from '../components/PlaceTile.jsx';
import { DemoBanner } from '../components/DetailParts.jsx';
import { KIND_ICONS } from '../components/Icons.jsx';
import { upcomingTrip, timeOf, dayLabel } from '../state/trip.js';
import { useClock } from '../hooks/useClock.js';
import { streak } from '../state/challenges.js';
import { here, nearestPlaces, fmtDist } from '../state/location.js';

// Home – one job: "what do I do next?". Greeting + search + 3 quick actions (header over the photo), the next trip item,
// places near you. Everything else is one tap away: challenges (streak chip), weather (Trip), suggestions (Explore).
export function Home() {
  useClock();   // "Next up" moves on by itself
  const p = getProfile(), next = upcomingTrip()[0], h = here(), s = streak();
  const first = p.name.split(' ')[0];
  const book = view => { closeSheet(); openBooking(view); };
  const NextIcon = next ? KIND_ICONS[next.kind] : CalendarPlus;
  return (
    <section className="screen active" id="home">
      <div className="scroll">
        <header className="home-head">
          <div className="home-top">
            <button className="avatar" id="homeAv" aria-label="Profile" onClick={() => go('profile')}><AvatarImg id={p.avatar} /></button>
            <button className={'streak-chip' + (s ? ' on' : '')} id="homeStreak" aria-label={`Challenges, ${s} day streak`}
                    onClick={() => { ui.achTab = 'challenges'; go('achievements'); }}><Flame size={16} aria-hidden="true" />{s}</button>
          </div>
          <h1 className="home-hi">Hi <span className="uname">{first}</span></h1>
          <input className="search" id="homeSearch" placeholder="Search places" aria-label="Search places" enterKeyHint="search" value={ui.homeQ}
                 onChange={e => { ui.homeQ = e.target.value; emit(); }}
                 onKeyDown={e => { if (e.key === 'Enter') go('explore', {q: e.target.value}); }} />
          <div className="quick">
            <button onClick={() => book('flights')}><Plane size={22} aria-hidden="true" />Flight</button>
            <button onClick={() => book('taxi')}><CarTaxiFront size={22} aria-hidden="true" />Taxi</button>
            <button onClick={() => openMeetups('')}><Users size={22} aria-hidden="true" />Meetups</button>
          </div>
        </header>
        <div className="home-body">
          <DemoBanner about />
          <button className="next-card" id="homeTrip" onClick={() => next ? openTripItem(next.id) : go('book')}>
            <span className="nx-ic"><NextIcon size={22} aria-hidden="true" /></span>
            <span className="nm"><small>{next ? 'Next up' : 'Nothing planned'}</small>
              <b>{next ? next.title : 'Book a flight or hotel'}</b>
              {next && <small>{`${dayLabel(next.t)}, ${timeOf(next.t)}`}</small>}</span>
            <ChevronRight size={20} className="chev" aria-hidden="true" />
          </button>
          <div className="sec-row"><h2 className="sec">Near you</h2>
            <button className="loc-pill" id="homeLoc" onClick={() => go('location')}><MapPin size={14} aria-hidden="true" />{h.name}</button></div>
          <div className="hscroll" id="nearYou">{nearestPlaces(3).map(({p: x, km}, i) => <PlaceTile key={x.id} p={x} sub={fmtDist(km)} priority={i === 0} />)}</div>
        </div>
      </div>
    </section>
  );
}
