import { useState } from 'react';
import { toast } from '../state/appStore.js';
import { getProfile, saveInterests } from '../state/userData.js';
import { go } from '../hooks/useHashRouter.js';
import { INTERESTS } from '../data/places.js';
import { AppBar } from '../components/AppBar.jsx';
import { FilterChips } from '../components/FilterChips.jsx';

export const MIN_INTERESTS = 3;

// Onboarding (after the first sign-up / first demo login): "What do you like?", at least 3, or Skip.
export function Interests() {
  const [picked, setPicked] = useState(() => getProfile().interests);
  const toggle = k => setPicked(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k]);
  const left = Math.max(0, MIN_INTERESTS - picked.length);
  const done = () => { saveInterests(picked); go('home', {replace:true}); toast('Thanks! Home now has ideas “For you”.'); };
  return (
    <section className="screen active" id="interests">
      <AppBar>Excelsior Explorer</AppBar>
      <div className="scroll">
        <h1 className="ltitle">What do you like?</h1>
        <p className="hint">Pick at least {MIN_INTERESTS} interests and we'll suggest places in Berlin for you. You can change them later in Edit Profile.</p>
        <FilterChips id="intChips" label="Interests" wrap options={INTERESTS} value={picked} onChange={toggle} />
        <p className="int-count" aria-live="polite">{left ? `Pick ${left} more` : `✓ ${picked.length} selected`}</p>
        <button className="btn" id="intDone" disabled={!!left} onClick={done}>Continue</button>
        <button className="btn ghost-link" id="skipBtn" onClick={() => go('home', {replace:true})}>Skip for now</button>
      </div>
    </section>
  );
}
