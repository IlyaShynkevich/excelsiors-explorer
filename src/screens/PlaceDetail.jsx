import { ui, closeSheet } from '../state/appStore.js';
import { user } from '../state/userData.js';
import { checkIn, toggleSave } from '../state/achievements.js';
import { upcomingMeetups } from '../state/meetups.js';
import { go, goBack, openBooking, openMeetups, TABS } from '../hooks/useHashRouter.js';
import { byId } from '../data/places.js';
import { bg } from '../lib/format.js';
import { BackButton } from '../components/AppBar.jsx';

export function PlaceDetail() {
  const p = byId(ui.detailId);
  const back = () => goBack(() => go(TABS.includes(ui.prev) ? ui.prev : 'explore'));
  return (
    <section className="screen active" id="detail">
      <div className="appbar"><BackButton id="backBtn" onClick={back} />{' '}</div>
      <div className="scroll" id="detailBody">{p && <Body p={p} />}</div>
    </section>
  );
}

function Body({ p }) {
  const isSaved = user.saved.includes(p.id), isVisited = user.visited.includes(p.id);
  const n = upcomingMeetups().filter(m => m.placeId === p.id).length;
  return (<>
    <div className="hero" style={{background: bg(p)}}></div>
    <div className="detail">
      <div className="row"><h2>{p.name}</h2><span className="km">{p.km + ' km'}</span></div>
      <div className="loc"><span className="ico">➤</span><span>{p.addr}<br />{`${p.area} · ${p.km} km from Alexanderplatz`}</span></div>
      <h3>About</h3>
      {p.about.map((t, i) => <p key={i}>{t}</p>)}
      <h3>Visitor Information</h3>
      <div className="info"><span className="ico">◷</span>{p.hours}</div>
      <div className="info"><span className="ico">€</span>{p.fee}</div>
      <p className="note">Opening hours and prices can change. Check the official website before you go.</p>
      <a className="wiki" href={`https://en.wikipedia.org/wiki/${encodeURIComponent(p.wiki.replace(/ /g,'_'))}`} target="_blank" rel="noopener">More info on Wikipedia ↗</a>
      <p className="note">Photo: Wikimedia Commons (free licence)</p>
      <div className="btns">
        <button className="btn" id="checkBtn" disabled={isVisited} onClick={() => checkIn(p.id)}>{isVisited ? '✓ Visited' : '📍 Check in here'}</button>
        <button className={`btn save-btn ${isSaved ? 'saved' : ''}`} id="saveBtn" onClick={() => toggleSave(p.id)}>{isSaved ? '✓ Saved' : 'Save Location'}</button>
        <button className="btn ghost" onClick={() => openMeetups(p.id)}>{`👥 Find a meetup here${n ? ` (${n})` : ''}`}</button>
        <button className="btn ghost" onClick={() => { closeSheet(); openBooking('taxi', p.id); }}>🚕 Get a taxi here</button>
      </div>
    </div>
  </>);
}
