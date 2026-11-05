// ---------- Booking: flights, hotels & taxi (demo – no real payment or provider) ----------
// Stage 2 "Book": flights and hotels are offered by several fictional providers side by side, so the
// traveler can pick the cheapest. Bookings are saved through createBooking() (userData.js).
import { ui, emit, toast, sheetOpen, queueUnlocks, queuePush } from './appStore.js';
import { checkUnlocks, createBooking, getBookings, cancelBooking } from './userData.js';
import { go } from '../hooks/useHashRouter.js';
import { CITIES, RIDES, DRIVERS, roadKm, taxiFare, spotName, flightResults, flightOffers, FLIGHT_TAX } from '../data/booking.js';
import { HOTELS, hotelOffers, nightsOf, hotelUnits } from '../data/hotels.js';
import { niceDate, hm, mkRef, isoAt, addDays } from '../lib/format.js';
import { motionMs } from '../lib/motion.js';

// Back button inside Book: the view each step goes back to when there is no app history
export const BOOK_PARENT = {flights:'hub', results:'flights', taxi:'hub', ride:'hub', hotels:'hub', hotelResults:'hotels', hotel:'hotelResults'};
// Each step has its own URL (#book/flights, #book/hotel/adlon …), so back, forward and reload work.
// opts.replace = replace the history entry (e.g. "Done" after a booking goes back to the hub).
export function setBookView(v, opts = {}) {
  if (v !== 'ride') stopRide();
  ui.bookView = v;
  go('book', {keepView: true, push: !opts.replace, replace: !!opts.replace});
}

// Saves booking b; badge pop-ups wait until the confirmation sheet is closed (or show right away if none is open).
export function addBooking(b) {
  const saved = createBooking(b);
  const fresh = checkUnlocks();
  // after the confirmation sheet opened (it then waits in the queue) or the screen transition of a live ride
  if (fresh.length) setTimeout(() => { if (sheetOpen()) queuePush(fresh); else queueUnlocks(fresh); }, motionMs('nav'));
  return saved;
}
export { getBookings };

// ---------- Flights ----------
// Airports of the current flight search: [from, to]
export const flightRoute = () => { const f = ui.fl, c = CITIES.find(x => x[0] === f.city); return f.toBerlin ? [c[0], 'BER'] : ['BER', c[0]]; };
export const flightTax = () => FLIGHT_TAX * ui.fl.pax;
export const FLIGHT_FILTERS = [['bag', '🧳 Baggage included'], ['free', '↩️ Free cancellation']];
const offerOk = (o, filters) => (!filters.includes('bag') || o.bag) && (!filters.includes('free') || o.free) && (!filters.includes('breakfast') || o.breakfast);

// Flights of the current search, each with its provider offers (filtered, cheapest first), sorted by ui.fl.sort.
// Flights without a matching offer are left out.
export function flightList() {
  const f = ui.fl;
  const list = flightResults(f).map(r => ({r, offers: flightOffers(r, f).filter(o => offerOk(o, f.filters))})).filter(x => x.offers.length);
  const from = x => x.offers[0].total;
  const by = {price: (a, b) => from(a) - from(b), fast: (a, b) => a.r.d - b.r.d || from(a) - from(b), stops: (a, b) => a.r.stop - b.r.stop || from(a) - from(b)};
  return list.sort(by[f.sort] || by.price);
}
export const setFlightSort = s => { ui.fl.sort = s; emit(); };
export function toggleFilter(form, k) {
  const fs = ui[form].filters, i = fs.indexOf(k);
  if (i >= 0) fs.splice(i, 1); else fs.push(k);
  emit();
}
export const resetFilters = form => { ui[form].filters = []; emit(); };

// Books offer o of flight r for the lead passenger; cheapest = o was the cheapest offer in the list.
export function bookFlight(r, o, name, cheapest) {
  const f = ui.fl, [A, B] = flightRoute();
  return addBooking({type:'flight', ref:mkRef(), provider:o.name, price:o.total, cheapest,
    title:`${A} → ${B} · ${r.airline}`, sub:`${niceDate(f.date)}, ${hm(r.dep)} · ${f.pax} pax · ${name}`,
    start:isoAt(f.date, r.dep), end:isoAt(f.date, r.arr),
    details:{from:A, to:B, airline:r.airline, flightNo:r.no, stops:r.stop, pax:f.pax, cls:f.cls, passenger:name,
             fare:o.fare, bagFee:o.bagFee, bag:o.bag, freeCancel:o.free, taxes:o.taxes}});
}

// ---------- Hotels ----------
export const HOTEL_SORTS = [['price', 'Cheapest'], ['stars', 'Stars']];
export const HOTEL_FILTERS = [['budget', 'Under €120/night'], ['stars4', '★ 4 stars and up'], ['free', '↩️ Free cancellation'], ['breakfast', '🍳 Breakfast']];
export const hotelNights = () => nightsOf(ui.ht.checkIn, ui.ht.checkOut);
export const hotelCityName = () => ui.ht.city === 'BER' ? 'Berlin' : (CITIES.find(c => c[0] === ui.ht.city) || [, 'Berlin'])[1];
// Offers of hotel h that match the filters (cheapest first)
export const hotelOffersFor = h => hotelOffers(h, ui.ht).filter(o => offerOk(o, ui.ht.filters));
// Hotels of the search (demo: only Berlin has hotels) with their offers, filtered and sorted
export function hotelList() {
  const s = ui.ht;
  if (s.city !== 'BER') return [];
  const list = HOTELS.map(h => ({h, offers: hotelOffersFor(h)}))
    .filter(x => x.offers.length && (!s.filters.includes('stars4') || x.h.stars >= 4) && (!s.filters.includes('budget') || x.offers[0].rate <= 120));
  const from = x => x.offers[0].total;
  return list.sort(s.sort === 'stars' ? (a, b) => b.h.stars - a.h.stars || from(a) - from(b) : (a, b) => from(a) - from(b));
}
export const setHotelSort = v => { ui.ht.sort = v; emit(); };
export function setHotelDates(k, v) {
  const s = ui.ht;
  if (!v) return emit();
  s[k] = v;
  if (s.checkOut <= s.checkIn) s.checkOut = addDays(s.checkIn, 1);              // check-out at least one night later
  if (nightsOf(s.checkIn, s.checkOut) > 30) s.checkOut = addDays(s.checkIn, 30);
  emit();
}
export function openHotel(id) { ui.ht.sel = id; setBookView('hotel'); }

// Books offer o of hotel h for the guest name; cheapest = o was the cheapest offer in the list.
export function bookHotel(h, o, name, cheapest) {
  const s = ui.ht, units = hotelUnits(h, s.guests);
  return addBooking({type:'hotel', ref:mkRef(), provider:o.name, price:o.total, cheapest,
    title:h.name, sub:`${niceDate(s.checkIn)} – ${niceDate(s.checkOut)} · ${o.nights} night${o.nights > 1 ? 's' : ''} · ${s.guests} guest${s.guests > 1 ? 's' : ''} · ${name}`,
    start:s.checkIn + 'T15:00', end:s.checkOut + 'T11:00',   // check-in / check-out times (demo)
    details:{hotelId:h.id, hotelName:h.name, area:h.area, city:'Berlin', guests:s.guests, units, hostel:!h.stars, nights:o.nights, guest:name,
             rate:o.rate, room:o.room, taxes:o.taxes, breakfast:o.breakfast, freeCancel:o.free}});
}

// ---------- Taxi ----------
// Books the taxi in ui.tx. Scheduled: returns {ref, when, rideName}. Now: starts the live ride view.
export function requestTaxi() {
  const t = ui.tx;
  const km = roadKm(t.from, t.to), ride = RIDES.find(r => r.id === t.ride), price = taxiFare(km) * ride.f, mins = Math.round(km * 2.6 + 4);
  const when = t.when === 'now' ? 'Now' : new Date(t.time).toLocaleString('en-GB', {weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
  const at = t.when === 'now' ? new Date() : new Date(t.time), local = d => new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
  const {ref} = addBooking({type:'taxi', ref:mkRef(), provider:'', price, title:`${spotName(t.from)} → ${spotName(t.to)}`, sub:`${ride.name} · ${when}`,
    start:local(at), end:local(new Date(at.getTime() + mins * 6e4)), details:{from:t.from, to:t.to, ride:ride.id, km:Math.round(km * 10) / 10}});
  if (t.when === 'later') return {ref, when, rideName: ride.name};
  const eta = 3 + (Math.random() * 5 | 0);
  ui.ride = {ref, from:t.from, to:t.to, rideName:ride.name, price, eta, eta0:eta, pos:8, status:'Driver is on the way', d:DRIVERS[Math.random() * DRIVERS.length | 0]};
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
  if (ui.ride && ui.ride.ref) cancelBooking(ui.ride.ref);
  toast('Ride cancelled'); setBookView('hub', {replace: true});
}
