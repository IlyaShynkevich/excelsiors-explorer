import { useState } from 'react';
import { ui, closeSheet, openSheet } from '../state/appStore.js';
import { user } from '../state/userData.js';
import { checkIn, toggleSave } from '../state/achievements.js';
import { upcomingMeetups } from '../state/meetups.js';
import { go, goBack, openBooking, openMeetups, TABS } from '../hooks/useHashRouter.js';
import { byId } from '../data/places.js';
import { Photo } from '../components/Photo.jsx';
import { isOpenNow } from '../lib/hours.js';
import { BackButton } from '../components/AppBar.jsx';
import { DietTags } from '../components/PlaceMeta.jsx';

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
  const n = upcomingMeetups().filter(m => m.placeId === p.id).length, open = isOpenNow(p);
  // the button you just tapped pops once (motion.css .bump); the label text stays the same
  const [bump, setBump] = useState('');
  const pop = id => ({className: bump === id ? ' bump' : '', onAnimationEnd: e => { if (e.target === e.currentTarget) setBump(''); }});
  const ck = label => <span><span className="ck">✓</span>{' ' + label}</span>;
  const chk = pop('check'), sav = pop('save');
  // wiki: "Title" (English Wikipedia), "de:Title" (German) or '' (no article)
  const [lang, title] = p.wiki.startsWith('de:') ? ['de', p.wiki.slice(3)] : ['en', p.wiki];
  const wiki = title && `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g,'_'))}`;
  return (<>
    <Photo className="hero" p={p} />
    <div className="detail">
      <div className="row"><h2>{p.name}</h2><span className="km">{p.km + ' km'}</span></div>
      <div className="loc"><span className="ico">➤</span><span>{p.addr}<br />{`${p.area} · ${p.km} km from Alexanderplatz`}</span></div>
      <h3>About</h3>
      {p.about.map((t, i) => <p key={i}>{t}</p>)}
      <h3>Visitor Information</h3>
      <div className="info"><span className="ico">◷</span><span>{p.hours}<br /><span className={'oc ' + (open ? 'is-open' : 'is-closed')}>{open ? 'Open now' : 'Closed now'}</span></span></div>
      <div className="info"><span className="ico">€</span>{p.fee}</div>
      <p className="note">Opening hours and prices can change. Check the official website before you go.</p>
      {p.diet.length > 0 && <><h3>Dietary options</h3><DietTags p={p} note /></>}
      {wiki && <a className="wiki" href={wiki} target="_blank" rel="noopener">{lang === 'de' ? 'More info on Wikipedia (German) ↗' : 'More info on Wikipedia ↗'}</a>}
      <p className="note">Photo: Wikimedia Commons (free licence)</p>
      <div className="btns">
        <button className={'btn' + chk.className} id="checkBtn" disabled={isVisited} onAnimationEnd={chk.onAnimationEnd}
                onClick={() => { setBump('check'); checkIn(p.id); }}>{isVisited ? ck('Visited') : '📍 Check in here'}</button>
        <button className={`btn save-btn ${isSaved ? 'saved' : ''}${sav.className}`} id="saveBtn" onAnimationEnd={sav.onAnimationEnd}
                onClick={() => { setBump('save'); toggleSave(p.id); }}>{isSaved ? ck('Saved') : 'Save Location'}</button>
        <button className="btn ghost" onClick={() => openMeetups(p.id)}>{`👥 Find a meetup here${n ? ` (${n})` : ''}`}</button>
        <button className="btn ghost" id="dirBtn" onClick={() => openSheet('directions', {to: p.id, name: p.name})}>🧭 Directions</button>
        <button className="btn ghost" onClick={() => { closeSheet(); openBooking('taxi', p.id); }}>🚕 Get a taxi here</button>
      </div>
    </div>
  </>);
}
