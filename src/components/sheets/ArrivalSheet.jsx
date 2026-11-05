import { closeSheet } from '../../state/appStore.js';
import { allMeetups, joinedM } from '../../state/meetups.js';
import { nearestPlaces, fmtDist } from '../../state/location.js';
import { openDetail, openMeetup } from '../../hooks/useHashRouter.js';
import { COORDS, spotName } from '../../data/booking.js';
import { byId } from '../../data/places.js';
import { byHotel } from '../../data/hotels.js';
import { dayDiff, pad } from '../../lib/format.js';
import { Photo } from '../Photo.jsx';

const firstSentence = t => (t.match(/^.*?[.!?](\s|$)/) || [t])[0].trim();

// After a check-in ("I'm here") or "I've arrived": where you are, a short fact, a joined meetup there today,
// the quests this check-in completed and three places nearby. spot = place id, 'ht-<hotel>' or a taxi spot.
export function ArrivalSheet({ spot, quests = [] }) {
  const p = byId(spot), h = spot.startsWith('ht-') && byHotel(spot.slice(3));
  const fact = p ? firstSentence(p.about[0]) : h ? h.short : 'Welcome! Here are some places to start from.';
  const mts = allMeetups().filter(m => m.placeId === spot && joinedM(m) && dayDiff(m.start) === 0);
  const near = COORDS[spot] ? nearestPlaces(3, COORDS[spot], [spot]) : [];
  const time = t => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  return (<>
    <div className="big-emoji">{h ? '🛎️' : '📍'}</div>
    <div className="kicker">{p || h ? 'Checked in' : 'Arrived'}</div>
    <h3 id="arrTitle">{`You arrived at ${spotName(spot)}`}</h3>
    <p>{fact}</p>
    {quests.length > 0 && <div className="arr-quests" id="arrQuests">{quests.map(q => (
      <div key={q.id}><span aria-hidden="true">{q.icon}</span><span>{'Challenge complete: ' + q.title}</span><b>{`+${q.pts}`}</b></div>
    ))}</div>}
    {mts.map(m => (
      <button className="chat-link arr-mt" key={m.id} onClick={() => { closeSheet(); openMeetup(m.id); }}>
        <span className="ic" aria-hidden="true">👥</span>
        <span className="nm"><b>{m.title}</b><small>{`Your meetup here today at ${time(m.start)}`}</small></span><span className="chev">›</span>
      </button>
    ))}
    {near.length > 0 && <>
      <h4 className="arr-h">Nearby</h4>
      <div className="arr-near" id="arrNear">{near.map(({p: x, km}) => (
        <button className="recent-row" key={x.id} onClick={() => { closeSheet(); openDetail(x.id); }}>
          <Photo className="thumb" p={x} />
          <div><b>{x.name}</b><small>{`${fmtDist(km)} · ${x.area}`}</small></div>
        </button>
      ))}</div>
    </>}
    <button className="btn" id="arrDone" onClick={() => closeSheet()}>Nice!</button>
  </>);
}
