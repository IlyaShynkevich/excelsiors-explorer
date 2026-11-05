import { ui, emit, closeSheet } from '../state/appStore.js';
import { getProfile } from '../state/userData.js';
import { go, openBooking, openMeetups } from '../hooks/useHashRouter.js';
import { byId, POPULAR, RECENT, PLACES } from '../data/places.js';
import { AvatarImg } from '../components/Avatar.jsx';
import { PlaceTile } from '../components/PlaceTile.jsx';
import { WeatherStrip } from '../components/WeatherStrip.jsx';
import { upcomingTrip, timeOf, dayLabel } from '../state/trip.js';
import { unreadCount } from '../state/reminders.js';
import { useClock } from '../hooks/useClock.js';
import { todaysQuests } from '../state/challenges.js';
import { here, nearestPlaces, fmtDist } from '../state/location.js';
import { demoDays, appToday } from '../state/clock.js';
import { niceDate } from '../lib/format.js';
import { QuestList, Streak } from '../components/Quests.jsx';

// "For you": places matching most of the user's interests first (ties keep the data order); without interests, a mix
const MIX = ['eastside','museuminsel','tiergarten','markthalle','hackesche','curry36','tempelhof','charlottenburg'];
function forYou(interests) {
  if (!interests.length) return MIX.map(byId);
  return PLACES.map((p, i) => ({p, i, s: p.tags.filter(t => interests.includes(t)).length}))
    .sort((a, b) => b.s - a.s || a.i - b.i).slice(0, 8).map(x => x.p);
}

export function Home() {
  useClock();   // reminders become due on the real clock
  const p = getProfile(), n = unreadCount(), next = upcomingTrip()[0], h = here();
  const book = view => { closeSheet(); openBooking(view); };
  return (
    <section className="screen active" id="home">
      <div className="home-top">
        <button className="avatar" id="homeAv" aria-label="Profile" onClick={() => go('profile')}><AvatarImg id={p.avatar} /></button>
        <button className="bell" id="homeBell" aria-label={'Reminders' + (n ? `, ${n} unread` : '')} onClick={() => go('reminders')}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>
          {n > 0 && <span className="bell-n">{n > 9 ? '9+' : n}</span>}
        </button>
      </div>
      <div className="scroll">
        <div className="panel">
          <h2>Hi <span className="uname">{p.name}</span>,</h2>
          <p className="sub">What would you like to do next?</p>
          <input className="search" id="homeSearch" placeholder="Search destinations..." enterKeyHint="search" value={ui.homeQ}
                 onChange={e => { ui.homeQ = e.target.value; emit(); }}
                 onKeyDown={e => { if (e.key === 'Enter') go('explore', {q: e.target.value}); }} />
          <div className="quick">
            <button onClick={() => book('flights')}><span>✈️</span>Book a flight</button>
            <button onClick={() => book('taxi')}><span>🚕</span>Get a taxi</button>
            <button onClick={() => openMeetups('')}><span>👥</span>Meetups</button>
          </div>
          <button className="chat-link trip-cta" id="homeTrip" onClick={() => go('trip')}><span className="ic" aria-hidden="true">🧳</span>
            <span className="nm"><b>My Trip</b><small>{next ? `Next: ${next.title} · ${dayLabel(next.t)}, ${timeOf(next.t)}` : 'Your bookings and meetups, day by day'}</small></span>
            <span className="chev">›</span></button>
          <button className="ch-card" id="homeQuests" onClick={() => { ui.achTab = 'challenges'; go('achievements'); }}>
            <span className="ch-head"><b>Today's challenges</b><Streak /></span>
            {demoDays() > 0 && <small className="ch-demo">{`Demo date: ${niceDate(appToday())}`}</small>}
            <QuestList quests={todaysQuests()} compact />
          </button>
          <div className="sec-row"><h3>Near you</h3><button className="link-btn" id="homeLoc" onClick={() => go('location')}>{'📍 ' + h.name}</button></div>
          <div className="hscroll" id="nearYou">{nearestPlaces(3).map(({p: x, km}) => <PlaceTile key={x.id} p={x} sub={fmtDist(km)} />)}</div>
          <WeatherStrip />
          <div className="sec-row"><h3>For you</h3>{p.interests.length > 0 && <button className="link-btn" onClick={() => go('editProfile')}>Edit interests</button>}</div>
          {!p.interests.length && <p className="sub fy-hint">Tell us what you like and we'll pick places for you. <button className="link-btn" onClick={() => go('editProfile')}>Choose interests</button></p>}
          <div className="hscroll" id="forYou">{forYou(p.interests).map(x => <PlaceTile key={x.id} p={x} />)}</div>
          <h3>Popular in Berlin</h3>
          <div className="grid" id="popular">{POPULAR.map(id => <PlaceTile key={id} p={byId(id)} />)}</div>
          <h3>Recently Viewed</h3>
          <div className="hscroll" id="recentHome">{RECENT.map(id => <PlaceTile key={id} p={byId(id)} />)}</div>
        </div>
      </div>
    </section>
  );
}
