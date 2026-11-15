import { useState } from 'react';
import { MapPin, Navigation, Check } from 'lucide-react';
import { openSheet } from '../state/appStore.js';
import { user } from '../state/userData.js';
import { here, kmToSpot, fmtDist, isAt, setDemoSpot } from '../state/location.js';
import { checkIn, checkedInToday } from '../state/challenges.js';

// The primary action of a place or hotel page (spot id). Within 150 m: "I'm here" (check in, Stage 4).
// Further away: "Directions", with one small line under it: the distance and, with a demo location, "Put me here".
// ghost = shown as a secondary button (pages that already have another primary action, e.g. a booking).
// note = false: no line under Directions (the place page shows the distance in its meta line; "Put me here" is in Profile › Demo tools).
export function HereAction({ spot, name, ghost, note = true }) {
  const [bump, setBump] = useState(false);   // the button pops once when tapped (motion.css .bump)
  const today = checkedInToday(spot), before = user.visited.includes(spot);
  const cls = 'btn' + (ghost ? ' ghost' : '') + (bump ? ' bump' : '');
  if (isAt(spot)) return (<>
    <button className={cls} id="checkBtn" disabled={today}
            onAnimationEnd={e => { if (e.target === e.currentTarget) setBump(false); }}
            onClick={() => { setBump(true); checkIn(spot); }}>
      {today ? <><Check size={18} aria-hidden="true" /> Checked in today</> : <><MapPin size={18} aria-hidden="true" /> I'm here</>}
    </button>
  </>);
  return (<>
    <button className={cls} id="farDirections" onClick={() => openSheet('directions', {to: spot, name})}><Navigation size={18} aria-hidden="true" /> Directions</button>
    {note && <p className="here-far" id="hereFar">
      {`${fmtDist(kmToSpot(spot))} away`}{before && ' · visited'}
      {!here().real && <> · <button className="link-btn" id="putMeHere" onClick={() => setDemoSpot(spot)}>Put me here (demo)</button></>}
    </p>}
  </>);
}
