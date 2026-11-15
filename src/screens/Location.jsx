import { ui } from '../state/appStore.js';
import { getLocation } from '../state/userData.js';
import { geoState, here, setDemoSpot, setRealLocation } from '../state/location.js';
import { go } from '../hooks/useHashRouter.js';
import { DEMO_SPOTS } from '../data/location.js';
import { spotName } from '../data/booking.js';
import { byId } from '../data/places.js';
import { byHotel } from '../data/hotels.js';
import { AppBar } from '../components/AppBar.jsx';
import { Navigation, MapPin, BedDouble, TrainFront, Check } from 'lucide-react';

const spotIcon = id => id.startsWith('ht-') ? BedDouble : id === 'alex' || id === 'ber' ? TrainFront : MapPin;

const areaOf = id => id.startsWith('ht-') ? 'Hotel · ' + (byHotel(id.slice(3)) || {area: ''}).area : byId(id) ? byId(id).area : 'Mitte';

// "Where am I?" (Stage 4): demo location picker (default) or the real location (asks only when switched on)
export function Location() {
  const l = getLocation(), g = geoState(), h = here();
  const spots = DEMO_SPOTS.some(([id]) => id === l.spot) ? DEMO_SPOTS : [[l.spot], ...DEMO_SPOTS];   // e.g. after a taxi to BER
  const status = l.real ? (g.status === 'on' ? `Using your real location${g.acc ? ` (accurate to about ${g.acc} m)` : ''}.` : 'Finding your location…')
                        : `Using the demo location: ${h.name}.`;
  return (
    <section className="screen active" id="location">
      <AppBar back="explore" title="Where am I?" />
      <div className="scroll">
        <h1 className="ltitle">Where am I?</h1>
        <div className="settings loc-real">
          <button className="item" id="realLoc" role="switch" aria-checked={l.real} onClick={() => setRealLocation(!l.real)}>
            <span className="l"><span className="ico"><Navigation size={18} aria-hidden="true" /></span>Use my real location</span><span className={'switch' + (l.real ? ' on' : '')}></span></button>
        </div>
        <p className="loc-status" id="locStatus" role="status">{status}</p>
        {g.msg && <p className="loc-msg" id="locMsg" role="alert">{g.msg}</p>}
        <h2 className="sec">Demo location</h2>
        <div className={'loc-list' + (l.real ? ' muted-list' : '')} role="radiogroup" aria-label="Demo location">{spots.map(([id]) => {
          const on = !l.real && id === l.spot;
          return (
            <button key={id} role="radio" aria-checked={on} className={'loc-opt' + (on ? ' on' : '')} data-spot={id} onClick={() => setDemoSpot(id)}>
              <span className="loc-ic" aria-hidden="true">{(I => <I size={20} />)(spotIcon(id))}</span>
              <span className="loc-nm"><b>{spotName(id)}</b><small>{areaOf(id)}</small></span>
              <span className="loc-ck" aria-hidden="true">{on && <Check size={18} />}</span>
            </button>
          );
        })}</div>
        <button className="btn ghost loc-done" onClick={() => { ui.ex.sort = 'near'; go('explore'); }}>Show places near me</button>
      </div>
    </section>
  );
}
