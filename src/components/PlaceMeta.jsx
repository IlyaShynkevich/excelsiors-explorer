import { CAT_LABEL, DIETS } from '../data/places.js';

const DIET_LABEL = Object.fromEntries(DIETS);

// "Food · Nightlife · ● Open now" under a place name (Explore list, map preview)
export function PlaceMeta({ p, open }) {
  return (
    <div className="pmeta">
      <span>{p.cats.map(c => CAT_LABEL[c]).join(' · ')}</span>
      <span className={'oc ' + (open ? 'is-open' : 'is-closed')}>{open ? 'Open now' : 'Closed now'}</span>
    </div>
  );
}

// Dietary tags of a food place (demo data, indicative only)
export function DietTags({ p, note }) {
  if (!p.diet.length) return null;
  return (<>
    <div className="dtags" aria-label="Dietary options (indicative)">{p.diet.map(d => <span key={d}>{DIET_LABEL[d]}</span>)}</div>
    {note && <p className="note">Indicative, check with the venue.</p>}
  </>);
}
