import { useRef } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { ui, emit, openSheet } from '../state/appStore.js';
import { mtList, MT_FILTERS } from '../state/meetups.js';
import { openMeetups } from '../hooks/useHashRouter.js';
import { byId } from '../data/places.js';
import { AppBar } from '../components/AppBar.jsx';
import { FilterChips } from '../components/FilterChips.jsx';
import { MeetupCard } from '../components/MeetupCard.jsx';
import { useFlip } from '../hooks/useFlip.js';

// The place for a new meetup: the filtered place, the open place page, or the Brandenburg Gate
export const createMeetupSheet = () =>
  openSheet('createMeetup', {pre: ui.current === 'meetups' && ui.mtPlace ? ui.mtPlace : ui.current === 'detail' ? ui.detailId : 'brandenburg'});

export function Meetups() {
  const p = ui.mtPlace && byId(ui.mtPlace), list = mtList(), box = useRef(null);
  useFlip(box, '.mt-place, #mtList > *', ui.mtFilter + '|' + list.map(m => m.id).join());   // filter changes glide
  const none = ui.mtFilter === 'joined' ? 'You haven\'t joined a meetup yet.' : p ? 'No meetups planned here yet.' : 'No meetups match this filter.';
  return (
    <section className="screen active" id="meetups">
      <AppBar back="home" title="Meetups">
        <button className="ab-icon" aria-label="Create a meetup" onClick={createMeetupSheet}><Plus size={24} aria-hidden="true" /></button>
      </AppBar>
      <div className="scroll" ref={box}>
        <h1 className="ltitle">Meetups</h1>
        <FilterChips options={MT_FILTERS} value={ui.mtFilter} onChange={k => { ui.mtFilter = k; emit(); }} />
        <p className="mt-place" id="mtPlace" style={p ? undefined : {display: 'none'}}>
          {p && <><MapPin size={14} aria-hidden="true" /> At <b>{p.name}</b> · <button className="link-btn" onClick={() => openMeetups('')}>Show all</button></>}
        </p>
        <div id="mtList" className="stagger">
          {list.length ? list.map(m => <MeetupCard key={m.id} m={m} />) :
            <div className="empty">{none}<br /><br /><button className="pill" onClick={createMeetupSheet}>+ Create a meetup</button></div>}
        </div>
      </div>
    </section>
  );
}
