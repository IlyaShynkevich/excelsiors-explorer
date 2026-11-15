import { House, Search, Ticket, Luggage, CircleUser } from 'lucide-react';
import { go, TABS } from '../hooks/useHashRouter.js';
import { unreadCount } from '../state/reminders.js';

const ICONS = {home: House, explore: Search, book: Ticket, trip: Luggage, profile: CircleUser};
const LABELS = {home: 'Home', explore: 'Explore', book: 'Book', trip: 'Trip', profile: 'Profile'};

// Floating tab bar, only shown on the five tab screens. Trip shows the number of unread reminders (HIG: badges only for
// information that needs attention); the reminders themselves open from the bell in Trip's top bar.
export function TabBar({ current }) {
  const n = unreadCount();
  return (
    <nav id="nav" className={TABS.includes(current) ? 'show' : ''}>
      {TABS.map(t => { const Icon = ICONS[t]; return (
        <button key={t} className={t === current ? 'active' : ''} onClick={() => go(t)}
                aria-label={t === 'trip' && n ? `Trip, ${n} unread reminder${n === 1 ? '' : 's'}` : undefined}>
          <span className="tab-ic"><Icon aria-hidden="true" />{t === 'trip' && n > 0 && <span className="tab-n" aria-hidden="true">{n > 9 ? '9+' : n}</span>}</span>
          {LABELS[t]}
        </button>); })}
    </nav>
  );
}
