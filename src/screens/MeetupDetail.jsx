import { Navigation, MapPin, LogOut, MessageCircle, Clock, Star, Users } from 'lucide-react';
import { ui, openSheet } from '../state/appStore.js';
import { byMeetup, going, person, isMine, joinedM, toggleJoin } from '../state/meetups.js';
import { openChat, openDetail } from '../hooks/useHashRouter.js';
import { byId } from '../data/places.js';
import { whenText } from '../lib/format.js';
import { Photo } from '../components/Photo.jsx';
import { AppBar } from '../components/AppBar.jsx';
import { Pav, AvatarStack } from '../components/Avatar.jsx';
import { RoundActions, Clamp, Details, InfoRow } from '../components/DetailParts.jsx';

// Meetup page – decide and act: photo, title, one meta line, About, ONE primary button (Join, or Open chat once you're in),
// round actions (Directions, Place, Leave), the people as an avatar row; the full list and the host in "Details".
export function MeetupDetail() {
  const m = byMeetup(ui.meetupId);
  return (
    <section className="screen active" id="meetup">
      <AppBar overlay back="meetups" title={m && m.title} watch=".hero" />
      <div className="scroll" id="meetupBody">{m && <Body m={m} />}</div>
    </section>
  );
}

function Body({ m }) {
  const p = byId(m.placeId), g = going(m), host = person(m.host), j = joinedM(m), mine = isMine(m), full = g.length >= m.max;
  return (<>
    <Photo className="hero" size="hero" priority p={p} />
    <div className="detail">
      <h1 className="d-title">{m.title}</h1>
      <p className="d-meta">{`${whenText(m.start)} · ${p.name} · ${g.length}/${m.max} going`}</p>
      <Clamp><p>{m.desc}</p></Clamp>
      <div className="d-primary">
        {j ? <button className="btn" id="chatLink" onClick={() => openChat(m.id)}><MessageCircle size={18} aria-hidden="true" /> Open group chat</button>
           : <button className="btn" id="mtJoin" disabled={full} onClick={() => toggleJoin(m.id)}>{full ? 'Full' : 'Join'}</button>}
      </div>
      <RoundActions items={[
        {icon: Navigation, label: 'Directions', id: 'mtDirections', onClick: () => openSheet('directions', {to: p.id, name: p.name})},
        {icon: MapPin, label: 'Place', onClick: () => openDetail(p.id)},
        j && !mine && {icon: LogOut, label: 'Leave', id: 'mtLeave', onClick: () => toggleJoin(m.id)},
      ]} />
      <div className="mt-people"><AvatarStack people={g.slice(0, 5)} /><span>{`${g.length} going`}{mine ? ' · you host' : ''}</span></div>
      <Details id="mtDetails">
        <InfoRow icon={Clock}>{whenText(m.start, true)}</InfoRow>
        <InfoRow icon={MapPin}>{`${p.name}, ${p.addr}`}</InfoRow>
        <InfoRow icon={Star}>{'Hosted by ' + host.name + (host.me ? ' (you)' : '')}</InfoRow>
        <InfoRow icon={Users}>{`${g.length} / ${m.max} going${full ? ' · full' : ''}`}</InfoRow>
        <div className="plist">{g.map((x, i) => (
          <div key={i}><Pav x={x} /><span className="n">{x.name}{x.me && <span className="muted"> (you)</span>}</span>{x === host && <span className="htag">Host</span>}</div>
        ))}</div>
        {mine && <button className="btn ghost tr-danger" id="mtCancel" onClick={() => openSheet('cancelMeetup', {m})}>Cancel meetup</button>}
      </Details>
    </div>
  </>);
}
