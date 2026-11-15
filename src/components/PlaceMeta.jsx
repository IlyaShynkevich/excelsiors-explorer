import { DIETS } from '../data/places.js';

const DIET_LABEL = Object.fromEntries(DIETS);

// The one meta line under a place name (Explore cards, map preview): "2.1 km · Open now"
export function PlaceMeta({ p, dist, open }) {
  return (
    <span className="pmeta">
      {dist && <span>{dist}</span>}
      <span className={'oc ' + (open ? 'is-open' : 'is-closed')}>{open ? 'Open now' : 'Closed'}</span>
    </span>
  );
}

// Dietary tags of a food place (demo data, indicative only) – place page › Details
export function DietTags({ p, note }) {
  if (!p.diet.length) return null;
  return (<>
    <div className="dtags" aria-label="Dietary options (indicative)">{p.diet.map(d => <span key={d}>{DIET_LABEL[d]}</span>)}</div>
    {note && <p className="note">Indicative, check with the venue.</p>}
  </>);
}
