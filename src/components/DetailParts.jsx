import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, Info, X } from 'lucide-react';
import { demoNoteSeen, markDemoNoteSeen } from '../state/userData.js';
import { go } from '../hooks/useHashRouter.js';

// Pieces shared by the detail pages (place, hotel, meetup): "decide and act".

// One row of round secondary actions under the primary button. items = [{icon, label, onClick, on, id}]
export function RoundActions({ items }) {
  return (
    <div className="round-acts">{items.filter(Boolean).map(({icon: Icon, label, onClick, on, id}) => (
      <button key={label} id={id} className={'round-act' + (on ? ' on' : '')} onClick={onClick} aria-pressed={on === undefined ? undefined : on}>
        <span className="ra-ic"><Icon size={22} aria-hidden="true" /></span><span className="ra-lb">{label}</span>
      </button>
    ))}</div>
  );
}

// Text shortened to `lines` lines with a "More" button (only shown when the text is really longer)
export function Clamp({ children, lines = 3 }) {
  const box = useRef(null), [open, setOpen] = useState(false), [long, setLong] = useState(false);
  useLayoutEffect(() => { const el = box.current; if (el && !open) setLong(el.scrollHeight > el.clientHeight + 2); }, [children, open]);
  return (<>
    <div ref={box} className={'clamp' + (open ? ' open' : '')} style={{'--lines': lines}}>{children}</div>
    {long && !open && <button className="link-btn more-btn" onClick={() => setOpen(true)}>More</button>}
  </>);
}

// The one collapsed "Details" section of a detail page (HIG: one disclosure per view)
export function Details({ label = 'Details', children, id }) {
  return (
    <details className="disc" id={id}>
      <summary><span>{label}</span><ChevronDown size={20} aria-hidden="true" /></summary>
      <div className="disc-body">{children}</div>
    </details>
  );
}

// A row inside Details: icon + text
export const InfoRow = ({ icon: Icon, children }) => (
  <div className="info"><Icon size={18} className="info-ic" aria-hidden="true" /><span>{children}</span></div>
);

// One-time banner on first launch (Login or Home, whichever comes first): this is a demo. Marked as seen right away,
// so it shows once; after that the "About this demo" page (Profile) explains it.
export function DemoBanner({ about }) {
  const [show, setShow] = useState(() => !demoNoteSeen());
  useEffect(() => { if (show) markDemoNoteSeen(); }, []);
  if (!show) return null;
  return (
    <div className="demo-banner" role="note">
      <Info size={18} aria-hidden="true" />
      <span>Demo app: bookings, payments and people are simulated.</span>
      {about && <button className="link-btn" onClick={() => go('about')}>About</button>}
      <button className="db-x" aria-label="Close" onClick={() => setShow(false)}><X size={18} aria-hidden="true" /></button>
    </div>
  );
}
