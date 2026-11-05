// ---------- Stage 4 "Arrive": where the traveler is ----------
// Simulated by default: a demo spot from the picker (saved). "Use my real location" asks the browser for the
// position only when it is switched on (navigator.geolocation); denied or unavailable → back to the demo spot.
// The real position is kept in memory for this session only, never saved or sent anywhere.
import { emit, toast } from './appStore.js';
import { getLocation, saveLocation } from './userData.js';
import { COORDS, spotName, kmBetween } from '../data/booking.js';
import { NEARBY_M, ARRIVE_M, BERLIN_KM } from '../data/location.js';
import { BERLIN } from '../data/weather.js';
import { PLACES } from '../data/places.js';

// status: off (demo spot) | locating | on | denied | unavailable; msg = friendly note for the location screen
const geo = {status: 'off', pos: null, acc: 0, watch: null, msg: ''};
export const geoState = () => ({...geo});

// The current location: {ll: [lat, lon], real, name, spot ('' for the real position)}
export function here() {
  const l = getLocation();
  if (l.real && geo.pos) return {ll: geo.pos, real: true, name: 'Your location', spot: ''};
  return {ll: COORDS[l.spot], real: false, name: spotName(l.spot), spot: l.spot};
}
export const kmTo = ll => kmBetween(here().ll, ll);
export const kmToSpot = id => COORDS[id] ? kmTo(COORDS[id]) : null;
// "450 m", "1.2 km", "14 km"
export const fmtDist = km => km < 1 ? `${Math.max(10, Math.round(km * 100) * 10)} m` : `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
export const distLabel = id => { const km = kmToSpot(id); return km === null ? '' : fmtDist(km); };
export const isNearby = id => { const km = kmToSpot(id); return km !== null && km * 1000 <= NEARBY_M; };
export const isAt = id => { const km = kmToSpot(id); return km !== null && km * 1000 <= ARRIVE_M; };
// The n places closest to a point (default: the current location), nearest first: [{p, km}]
export const nearestPlaces = (n, from = here().ll, exclude = []) => PLACES.filter(p => COORDS[p.id] && !exclude.includes(p.id))
  .map(p => ({p, km: kmBetween(from, COORDS[p.id])})).sort((a, b) => a.km - b.km).slice(0, n);

function stopWatch() { if (geo.watch !== null && navigator.geolocation) navigator.geolocation.clearWatch(geo.watch); geo.watch = null; }

// Demo spot from the picker (also "Put me here", "I've arrived"); turns the real location off
export function setDemoSpot(spot, silent) {
  stopWatch(); Object.assign(geo, {status: 'off', pos: null, msg: ''});
  saveLocation({spot, real: false}); emit();
  if (!silent) toast('📍 You are now at ' + spotName(spot) + ' (demo)');
}

export function setRealLocation(on) {
  if (!on) { stopWatch(); Object.assign(geo, {status: 'off', pos: null, msg: ''}); saveLocation({real: false}); emit(); toast('Using the demo location'); return; }
  if (!navigator.geolocation) return fail(2);
  saveLocation({real: true}); Object.assign(geo, {status: 'locating', msg: ''}); emit();
  watch();
}
function watch() {
  stopWatch();
  geo.watch = navigator.geolocation.watchPosition(found, e => { if (!geo.pos || e.code === 1) fail(e.code); },
    {enableHighAccuracy: true, maximumAge: 30e3, timeout: 15e3});
}
function found(p) {
  const ll = [p.coords.latitude, p.coords.longitude], far = kmBetween(ll, [BERLIN.lat, BERLIN.lon]);
  Object.assign(geo, {pos: ll, acc: Math.round(p.coords.accuracy || 0), status: 'on',
    msg: far > BERLIN_KM ? `You seem to be outside Berlin (about ${Math.round(far)} km from the centre), so every place is far away. Pick a demo location to try "I'm here".` : ''});
  emit();
}
// code 1 = permission denied, 2 = position unavailable, 3 = timeout
function fail(code) {
  stopWatch(); saveLocation({real: false});
  Object.assign(geo, {status: code === 1 ? 'denied' : 'unavailable', pos: null,
    msg: code === 1 ? `Location access was denied, so the app uses your demo location (${spotName(getLocation().spot)}). You can allow it in your browser settings and try again.`
                    : `Your location isn't available right now, so the app uses your demo location (${spotName(getLocation().spot)}).`});
  emit();
  toast(code === 1 ? 'Location denied, using the demo location' : 'Location unavailable, using the demo location');
}
// On start: the real location was on before. Only continue if the browser still allows it (no prompt without a tap).
export function initLocation() {
  if (!getLocation().real) return;
  const off = () => { saveLocation({real: false}); emit(); };
  if (!navigator.geolocation || !navigator.permissions) return off();
  navigator.permissions.query({name: 'geolocation'}).then(r => {
    if (r.state !== 'granted') return off();
    geo.status = 'locating'; emit(); watch();
  }).catch(off);
}
