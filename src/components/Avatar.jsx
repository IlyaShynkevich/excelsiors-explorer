import { AVATARS } from '../data/avatars.js';

// The Lego picture (CSS variable --lego, set in main.jsx) or an emoji on a colour; fills its round container.
export function AvatarImg({ id }) {
  const a = AVATARS.find(x => x.id === id) || AVATARS[0];
  return a.e ? <span className="av-img" role="img" aria-label={a.label} style={{background: a.c}}>{a.e}</span>
             : <span className="av-img av-lego" role="img" aria-label={a.label}></span>;
}
// x is a person ({av: emoji}) or the signed-in user ME ({me: true, avatar})
export const avNode = x => x.me ? <AvatarImg id={x.avatar} /> : x.av;
export const Pav = ({ x, cls = '' }) => <span className={`pav ${cls}`}>{avNode(x)}</span>;

// Overlapping avatars of the first people going
export const AvatarStack = ({ people }) => <span className="stack">{people.map((x, i) => <Pav key={i} x={x} />)}</span>;
