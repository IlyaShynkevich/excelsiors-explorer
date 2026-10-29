import { ui, emit, openSheet } from '../state/appStore.js';
import { mtList, MT_FILTERS } from '../state/meetups.js';
import { openMeetups } from '../hooks/useHashRouter.js';
import { byId } from '../data/places.js';
import { AppBar } from '../components/AppBar.jsx';
import { FilterChips } from '../components/FilterChips.jsx';
import { MeetupCard } from '../components/MeetupCard.jsx';

// The place for a new meetup: the filtered place, the open place page, or the Brandenburg Gate
export const createMeetupSheet = () =>
  openSheet('createMeetup', {pre: ui.current === 'meetups' && ui.mtPlace ? ui.mtPlace : ui.current === 'detail' ? ui.detailId : 'brandenburg'});

export function Meetups() {
  const p = ui.mtPlace && byId(ui.mtPlace), list = mtList();
  const none = ui.mtFilter === 'joined' ? 'You haven\'t joined a meetup yet.' : p ? 'No meetups planned here yet.' : 'No meetups match this filter.';
  return (
    <section className="screen active" id="meetups">
      <AppBar back="home">Excelsior Explorer</AppBar>
      <div className="scroll">
        <div className="lt-row"><h1 className="ltitle">Meetups</h1><button className="add-btn" aria-label="Create a meetup" onClick={createMeetupSheet}>+</button></div>
        <p className="hint">Join a planned activity and meet other travelers in Berlin.</p>
        <FilterChips options={MT_FILTERS} value={ui.mtFilter} onChange={k => { ui.mtFilter = k; emit(); }} />
        <p className="mt-place" id="mtPlace" style={p ? undefined : {display: 'none'}}>
          {p && <>📍 Meetups at <b>{p.name}</b> · <a onClick={() => openMeetups('')}>Show all</a></>}
        </p>
        <div id="mtList">
          {list.length ? list.map(m => <MeetupCard key={m.id} m={m} />) :
            <div className="empty">{none}<br /><br /><button className="pill" onClick={createMeetupSheet}>+ Create a meetup</button></div>}
        </div>
        <p className="demo">Demo: meetups, people and chat are simulated.</p>
      </div>
    </section>
  );
}
