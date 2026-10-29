import { ui, toast, openSheet } from '../state/appStore.js';
import { byMeetup, going, person, isMine, joinedM, chatOf } from '../state/meetups.js';
import { openChat, openDetail } from '../hooks/useHashRouter.js';
import { byId } from '../data/places.js';
import { bg, whenText } from '../lib/format.js';
import { AppBar } from '../components/AppBar.jsx';
import { Pav } from '../components/Avatar.jsx';
import { JoinButton } from '../components/MeetupCard.jsx';

export function MeetupDetail() {
  const m = byMeetup(ui.meetupId);
  return (
    <section className="screen active" id="meetup">
      <AppBar back="meetups">{' '}</AppBar>
      <div className="scroll" id="meetupBody">{m && <Body m={m} />}</div>
    </section>
  );
}

function Body({ m }) {
  const p = byId(m.placeId), g = going(m), host = person(m.host), j = joinedM(m);
  const last = j ? chatOf(m).slice(-1)[0] : null;
  return (<>
    <div className="hero" style={{background: bg(p)}}></div>
    <div className="detail">
      <h2>{m.title}</h2>
      <div className="loc"><span className="ico">➤</span><span><a className="plink" onClick={() => openDetail(p.id)}>{p.name}</a><br />{p.addr}</span></div>
      <div className="info"><span className="ico">◷</span>{whenText(m.start, true)}</div>
      <div className="info"><span className="ico">★</span><span>Hosted by <Pav x={host} cls="in" />{' ' + host.name + (host.me ? ' (you)' : '')}</span></div>
      <div className="info"><span className="ico">◉</span>{`${g.length} / ${m.max} going${g.length >= m.max ? ' · full' : ''}`}</div>
      <div className="btns" style={{marginTop: 'var(--s4)'}}>{!isMine(m) && <JoinButton m={m} cls="btn" />}</div>
      <h3>About this meetup</h3>
      <p>{m.desc}</p>
      <h3>Who's going <small>{`${g.length} / ${m.max}`}</small></h3>
      <div className="plist">{g.map((x, i) => (
        <div key={i}><Pav x={x} /><span className="n">{x.name + (x.me ? ' ' : '')}{x.me && <span className="muted">(you)</span>}</span>{x === host && <span className="htag">Host</span>}</div>
      ))}</div>
      <h3>Group chat</h3>
      {j ? <button className="chat-link" id="chatLink" onClick={() => openChat(m.id)}><span className="ic">💬</span>
             <span className="nm"><b>{`Group chat · ${g.length} ${g.length === 1 ? 'person' : 'people'}`}</b><small>{last ? (last.me ? 'You' : last.n) + ': ' + last.x : 'No messages yet – say hi 👋'}</small></span><span className="chev">›</span></button>
         : <button className="chat-link locked" id="chatLink" onClick={() => toast('Join the meetup to unlock the group chat')}><span className="ic">🔒</span>
             <span className="nm"><b>Join to chat</b><small>Only people who joined can read and write messages.</small></span></button>}
      <p className="note">Demo: chat is simulated</p>
      {isMine(m) && <div className="btns"><button className="btn ghost" id="mtCancel" style={{color: 'var(--danger)'}} onClick={() => openSheet('cancelMeetup', {m})}>Cancel meetup</button></div>}
    </div>
  </>);
}
