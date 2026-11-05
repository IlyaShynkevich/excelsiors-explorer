import { useState } from 'react';
import { openSheet } from '../state/appStore.js';
import { user } from '../state/userData.js';
import { here, kmToSpot, fmtDist, isAt, setDemoSpot } from '../state/location.js';
import { checkIn, checkedInToday } from '../state/challenges.js';

// "I'm here" (Stage 4): check in at a place or hotel (spot id) when the current location is within 150 m.
// Further away: "You're about 1.2 km away." with Directions (and, with a demo location, "Put me here").
export function HereAction({ spot, name }) {
  const [bump, setBump] = useState(false);   // the button pops once when tapped (motion.css .bump)
  const today = checkedInToday(spot), before = user.visited.includes(spot);
  if (isAt(spot)) return (<>
    <button className={'btn' + (bump ? ' bump' : '')} id="checkBtn" disabled={today}
            onAnimationEnd={e => { if (e.target === e.currentTarget) setBump(false); }}
            onClick={() => { setBump(true); checkIn(spot); }}>
      {today ? <span><span className="ck">✓</span> Checked in today</span> : '📍 I\'m here'}
    </button>
    {!today && before && <p className="here-note">✓ Visited before · checking in again counts for today's challenges</p>}
  </>);
  return (
    <div className="here-far" id="hereFar" role="status">
      <span>{`📍 You're about ${fmtDist(kmToSpot(spot))} away.`}</span>{' '}
      <button className="link-btn" id="farDirections" onClick={() => openSheet('directions', {to: spot, name})}>Directions</button>
      {!here().real && <button className="link-btn" id="putMeHere" onClick={() => setDemoSpot(spot)}>Put me here (demo)</button>}
      {before && <small>✓ Visited before</small>}
    </div>
  );
}
