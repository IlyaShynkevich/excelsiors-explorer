import { Fragment, useLayoutEffect } from 'react';
import { ui, emit } from '../state/appStore.js';
import { byMeetup, going, joinedM, chatOf, sendMessage } from '../state/meetups.js';
import { stamp, whenText } from '../lib/format.js';
import { AppBar } from '../components/AppBar.jsx';
import { ChatBubble } from '../components/ChatBubble.jsx';

const GAP = 30 * 6e4;   // a new time separator after 30 min of silence
const sameAuthor = (a, b) => !!a.me === !!b.me && a.n === b.n;
export const scrollChat = () => { const s = document.getElementById('chatMsgs'); if (s) s.scrollTop = s.scrollHeight; };

export function MeetupChat() {
  const m = byMeetup(ui.meetupId);
  const msgs = m ? chatOf(m) : [], g = m ? going(m) : [], ty = m && ui.typing[m.id];
  // newest message in view whenever a message or the typing dots appear
  useLayoutEffect(scrollChat, [m, msgs.length, !!ty]);
  const submit = e => {
    e.preventDefault();
    const text = ui.chatDraft.trim();
    if (!text || !m || !joinedM(m)) return;
    ui.chatDraft = '';
    sendMessage(m, text);
  };
  return (
    <section className="screen active" id="chat">
      <AppBar back="meetup"><span className="ttl"><span id="chatTitle">{m && m.title}</span><small id="chatSub">{m && `${g.length} ${g.length === 1 ? 'person' : 'people'} · ${whenText(m.start)}`}</small></span></AppBar>
      <div className="scroll" id="chatMsgs" aria-live="polite">
        {m && <>
          <p className="sys">{`💬 Group chat for “${m.title}”`}<br />Demo: chat is simulated</p>
          {!msgs.length && <p className="sys">{g.length > 1 ? 'No messages yet – say hi 👋' : 'Nobody else has joined yet. Write the first message for when they do 👋'}</p>}
          {msgs.map((x, i) => {
            const prev = msgs[i - 1], next = msgs[i + 1], brk = !prev || x.t - prev.t > GAP;
            return <Fragment key={i}>
              {brk && <div className="day">{stamp(x.t)}</div>}
              <ChatBubble x={x} first={brk || !sameAuthor(prev, x)} last={!next || !sameAuthor(next, x) || next.t - x.t > GAP} fresh={ui.chatFresh && i === msgs.length - 1} />
            </Fragment>;
          })}
          {ty && <ChatBubble key="typing" x={{...ty, typing: true}} first last fresh />}
        </>}
      </div>
      <form className="chat-bar" id="chatForm" autoComplete="off" onSubmit={submit}>
        <input className="chat-in" id="chatInput" placeholder="Message" enterKeyHint="send" maxLength={500} aria-label="Message"
               value={ui.chatDraft} onChange={e => { ui.chatDraft = e.target.value; emit(); }} />
        <button className="send" id="chatSend" type="submit" aria-label="Send" disabled={!ui.chatDraft.trim()}
                onPointerDown={e => e.preventDefault()}><svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
      </form>
    </section>
  );
}
