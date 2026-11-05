import { ui, emit, closeSheet } from '../state/appStore.js';
import { getProfile } from '../state/userData.js';
import { go, openBooking, openMeetups } from '../hooks/useHashRouter.js';
import { byId, POPULAR, RECENT, PLACES } from '../data/places.js';
import { AvatarImg } from '../components/Avatar.jsx';
import { PlaceTile } from '../components/PlaceTile.jsx';
import { WeatherStrip } from '../components/WeatherStrip.jsx';

// "For you": places matching most of the user's interests first (ties keep the data order); without interests, a mix
const MIX = ['eastside','museuminsel','tiergarten','markthalle','hackesche','curry36','tempelhof','charlottenburg'];
function forYou(interests) {
  if (!interests.length) return MIX.map(byId);
  return PLACES.map((p, i) => ({p, i, s: p.tags.filter(t => interests.includes(t)).length}))
    .sort((a, b) => b.s - a.s || a.i - b.i).slice(0, 8).map(x => x.p);
}

export function Home() {
  const p = getProfile();
  const book = view => { closeSheet(); openBooking(view); };
  return (
    <section className="screen active" id="home">
      <div className="home-top">
        <button className="avatar" id="homeAv" aria-label="Profile" onClick={() => go('profile')}><AvatarImg id={p.avatar} /></button>
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
