import { dueReminders, remindersOn, remindersDemo, markRead, markAllRead, toggleReminders } from '../state/reminders.js';
import { KIND_ICONS } from '../components/Icons.jsx';
import { BellOff, Bell } from 'lucide-react';
import { go, openTripItem } from '../hooks/useHashRouter.js';
import { useClock } from '../hooks/useClock.js';
import { AppBar } from '../components/AppBar.jsx';

// In-app reminders list (bell on Home). Simulated: no push notifications, no permission request.
export function Reminders() {
  useClock();
  const on = remindersOn(), list = dueReminders(), unread = list.filter(r => !r.read).length;
  const open = r => { markRead([r.id]); openTripItem(r.itemId); };
  return (
    <section className="screen active" id="reminders">
      <AppBar back="trip" title="Reminders" />
      <div className="scroll">
        <h1 className="ltitle">Reminders</h1>
        {!on ? (
          <div className="empty" id="remOff">
            <div className="empty-ico" aria-hidden="true"><BellOff size={40} /></div>
            <b>Reminders are off</b>
            <button className="link-btn" onClick={toggleReminders}>Turn on reminders</button>
          </div>
        ) : list.length ? <>
          <div className="sec-row rm-head">
            <p className="hint" id="remCount">{unread ? `${unread} unread` : 'All read'}</p>
            {unread > 0 && <button className="link-btn" id="remAllRead" onClick={markAllRead}>Mark all as read</button>}
          </div>
          <div className="stagger" id="remList">{list.map(r => (
            <button className={'rm-item' + (r.read ? '' : ' unread')} key={r.id} data-kind={r.kind} onClick={() => open(r)}>
              <span className="tr-ic" aria-hidden="true">{(I => <I size={18} />)(KIND_ICONS[r.kind])}</span>
              <span className="rm-nm"><b>{r.title}</b><small>{r.text}</small><small className="rm-when">{r.when}</small></span>
              {!r.read && <span className="rm-dot" aria-label="Unread"></span>}
            </button>
          ))}</div>
        </> : (
          <div className="empty" id="remEmpty">
            <div className="empty-ico" aria-hidden="true"><Bell size={40} /></div>
            <b>No reminders right now</b>
            <p>They show up before flights, taxis, meetups and check-ins.</p>
          </div>
        )}
      </div>
    </section>
  );
}
