import { going, isMine, joinedM, toggleJoin } from '../state/meetups.js';
import { openMeetup } from '../hooks/useHashRouter.js';
import { byId } from '../data/places.js';
import { bg, whenText } from '../lib/format.js';
import { AvatarStack } from './Avatar.jsx';

// Join / Leave / Full / Hosting; cls is 'pill' (cards) or 'btn' (meetup page)
export function JoinButton({ m, cls }) {
  const join = e => { e.stopPropagation(); toggleJoin(m.id); };
  if (isMine(m)) return <span className={`${cls} host`}>★ Hosting</span>;
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
      <div className="img" style={{background: bg(p, true)}}><span className="when">{whenText(m.start)}</span></div>
      <div className="body">
        <h4>{m.title}</h4>
        <p>{`📍 ${p.name} · ${p.area}`}</p>
        <div className="mt-foot"><AvatarStack people={g.slice(0, 4)} />
          <span className={`going ${j ? 'in' : ''}`}>{`${j ? '✓ ' : ''}${g.length} / ${m.max} going`}</span><JoinButton m={m} cls="pill" /></div>
      </div>
    </div>
  );
}
