// ---------- Booking: flights & taxi (demo – no real payment or provider) ----------
import { ui, emit, toast, sheetOpen, queueUnlocks, queuePush } from './appStore.js';
import { user, persist, checkUnlocks } from './userData.js';
import { CITIES, RIDES, DRIVERS, roadKm, taxiFare, spotName } from '../data/booking.js';
import { niceDate, hm, mkRef } from '../lib/format.js';

export function setBookView(v) {
  if (v !== 'ride') stopRide();
  ui.bookView = v; emit();
  const s = document.querySelector('#book .scroll'); if (s) s.scrollTop = 0;
}

export function addBooking(b) {
  user.bookings.push(b);
  const fresh = checkUnlocks();
  persist();
  if (!fresh.length) return;
  // Show "badge unlocked" after the confirmation sheet is closed, or right away if none is open.
  setTimeout(() => { if (sheetOpen()) queuePush(fresh); else queueUnlocks(fresh); }, 400);
}

// Airports of the current flight search: [from, to]
export const flightRoute = () => { const f = ui.fl, c = CITIES.find(x => x[0] === f.city); return f.toBerlin ? [c[0], 'BER'] : ['BER', c[0]]; };
export const flightTax = () => 12.5 * ui.fl.pax;
// Books flight r for the lead passenger; returns the booking reference.
export function bookFlight(r, name) {
  const f = ui.fl, [A, B] = flightRoute(), total = r.price * f.pax + flightTax(), ref = mkRef();
  addBooking({type:'flight', ref, price:total, title:`${A} → ${B} · ${r.airline}`, sub:`${niceDate(f.date)}, ${hm(r.dep)} · ${f.pax} pax · ${name}`});
  return ref;
}

// Books the taxi in ui.tx. Scheduled: returns {ref, when, rideName}. Now: starts the live ride view.
export function requestTaxi() {
  const t = ui.tx;
  const km = roadKm(t.from, t.to), ride = RIDES.find(r => r.id === t.ride), price = taxiFare(km) * ride.f, ref = mkRef();
  const when = t.when === 'now' ? 'Now' : new Date(t.time).toLocaleString('en-GB', {weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
  addBooking({type:'taxi', ref, price, title:`${spotName(t.from)} → ${spotName(t.to)}`, sub:`${ride.name} · ${when}`});
  if (t.when === 'later') return {ref, when, rideName: ride.name};
  const eta = 3 + (Math.random() * 5 | 0);
  ui.ride = {from:t.from, to:t.to, rideName:ride.name, price, eta, eta0:eta, pos:8, status:'Driver is on the way', d:DRIVERS[Math.random() * DRIVERS.length | 0]};
  setBookView('ride'); startRide();
  return null;
}

let rideTimer = null;
export function stopRide() { clearInterval(rideTimer); rideTimer = null; }
function startRide() {
  stopRide();
  const tick = () => {
    const r = ui.ride; if (!r || ui.bookView !== 'ride') return stopRide();
    if (r.eta > 1) { r.eta--; r.pos = Math.min(80, r.pos + 70 / r.eta0); }
    else { r.status = 'Your driver has arrived'; r.pos = 80; stopRide(); toast('🚕 Your taxi is here!'); }
    emit();
  };
  rideTimer = setInterval(tick, 3000);               // 1 "minute" every 3 seconds for the demo
}
export function cancelRide() {
  stopRide();
  const last = user.bookings[user.bookings.length - 1]; if (last && last.type === 'taxi') { last.sub += ' · cancelled'; last.price = 0; persist(); }
  toast('Ride cancelled'); setBookView('hub');
}
