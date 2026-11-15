import { going, isMine, joinedM, toggleJoin } from '../state/meetups.js';
import { openMeetup } from '../hooks/useHashRouter.js';
import { byId } from '../data/places.js';
import { whenText } from '../lib/format.js';
import { Photo } from './Photo.jsx';

// Join / Leave / Full / Hosting; cls is 'pill' (cards) or 'btn' (meetup page)
export function JoinButton({ m, cls }) {
  const join = e => { e.stopPropagation(); toggleJoin(m.id); };
  if (isMine(m)) return <span className={`${cls} host`}>Hosting</span>;
  if (joinedM(m)) return <button className={`${cls} ghost`} onClick={join}>Leave</button>;
  if (going(m).length >= m.max) return <button className={cls} disabled>Full</button>;
  return <button className={cls} onClick={join}>Join</button>;
}

// A div, not a button, because it contains the Join button; Enter opens it like a click.
export function MeetupCard({ m }) {
  const p = byId(m.placeId), g = going(m), j = joinedM(m);
  const open = () => openMeetup(m.id);
  return (
    <div className="card mt-card" role="button" tabIndex={0} onClick={open} onKeyDown={e => { if (e.key === 'Enter' && e.target === e.currentTarget) open(); }}>
      <Photo className="img" size="card" p={p} shade><span className="when">{whenText(m.start)}</span></Photo>
      <div className="body mt-body">
        <span className="nm"><h2>{m.title}</h2><span className="pmeta"><span>{p.name}</span><span className={j ? 'going in' : 'going'}>{`${g.length}/${m.max} going`}</span></span></span>
        <JoinButton m={m} cls="pill tint" />
      </div>
    </div>
  );
}
