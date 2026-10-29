import { ME } from '../state/userData.js';
import { avNode } from './Avatar.jsx';

// One chat message. first = show the name above, last = show the avatar, fresh = pop-in animation.
// x = {me: true, x} for your own messages, {n, av, x} for others, plus typing: true for the typing dots.
export function ChatBubble({ x, first, last, fresh }) {
  const cls = `msg${x.me ? ' me' : ''}${first ? ' first' : ''}${fresh ? ' new' : ''}`;
  if (x.me) return (
    <div className={cls}><div className="bw">{first && <span className="who">{ME.name}</span>}<div className="b">{x.x}</div></div>
      <span className={'pav' + (last ? '' : ' hide')}>{avNode(ME)}</span></div>
  );
  return (
    <div className={cls}><span className={'pav' + (last ? '' : ' hide')}>{x.av}</span><div className="bw">{first && <span className="who">{x.n}</span>}
      {x.typing ? <div className="b typing" aria-label="typing"><i></i><i></i><i></i></div> : <div className="b">{x.x}</div>}</div></div>
  );
}
