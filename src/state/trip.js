// ---------- Stage 3 "Trip": overview, change / cancel, directions start (demo) ----------
// The timeline is built from the bookings (userData.js) and the joined meetups (meetups.js).
// Changing or cancelling only updates the saved booking; prices, fees and refunds are demo values.
import { emit, toast, closeSheet } from './appStore.js';
import { getBookings, getBooking, updateBooking, cancelBooking } from './userData.js';
import { allMeetups, joinedM, isMine, byMeetup } from './meetups.js';
import { CITIES, RIDES, roadKm, taxiFare, spotName, flightResults, flightOffers } from '../data/booking.js';
import { byHotel, hotelOffers, nightsOf, hotelSpot } from '../data/hotels.js';
import { byId } from '../data/places.js';
import { hm, niceDate, isoAt, ymd, pad } from '../lib/format.js';

export const TRIP_ICONS = {flight: '✈️', hotel: '🏨', taxi: '🚕', meetup: '👥'};
const MEETUP = 'm-';                                      // trip ids: booking ref, or 'm-' + meetup id
const r2 = n => Math.round(n * 100) / 100;
// local 'YYYY-MM-DDTHH:MM' ↔ time in ms
export const parseLocal = s => { const t = s ? new Date(s).getTime() : NaN; return isNaN(t) ? null : t; };
export const toLocal = t => { const d = new Date(t); return ymd(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
export const timeOf = t => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
export const dayLabel = t => new Date(t).toLocaleDateString('en-GB', {weekday: 'short', day: 'numeric', month: 'short'});

// One booking → its line under the title (provider or place)
const via = b => b.type === 'taxi' ? (b.details.ride ? (RIDES.find(r => r.id === b.details.ride) || {name: 'Taxi'}).name + ' taxi' : 'Taxi')
  : b.provider ? 'via ' + b.provider : '';

// Every entry of the timeline: {key, id, kind, t (ms or null), title, sub, status, cancelled, label}
// Hotels have two entries (check-in and check-out). Old bookings without a date have t = null.
export function tripItems() {
  const out = [];
  getBookings().forEach(b => {
    const t = parseLocal(b.start), cancelled = b.status === 'Cancelled', base = {id: b.ref, kind: b.type, status: b.status, cancelled, b};
    if (b.type === 'hotel') {
      const area = b.details.area ? ' · ' + b.details.area : '';
      out.push({...base, key: b.ref + ':in', t, label: 'Check-in', title: b.title, sub: via(b) + area});
      const t2 = parseLocal(b.end);
      if (t2) out.push({...base, key: b.ref + ':out', t: t2, label: 'Check-out', title: b.title, sub: via(b) + area});
    } else if (b.type === 'flight') {
      out.push({...base, key: b.ref, t, label: b.details.flightNo ? 'Flight ' + b.details.flightNo : 'Flight', title: b.title.replace(/ · .*$/, '') || b.title,
                sub: [b.details.airline, via(b)].filter(Boolean).join(' · ')});
    } else {
      out.push({...base, key: b.ref, t, label: 'Pick-up', title: b.title, sub: via(b)});
    }
  });
  allMeetups().filter(joinedM).forEach(m => {
    const p = byId(m.placeId);
    out.push({key: MEETUP + m.id, id: MEETUP + m.id, kind: 'meetup', t: m.start, label: 'Meetup', title: m.title,
              sub: p ? p.name : '', status: isMine(m) ? 'Hosting' : 'Joined', cancelled: false, m});
  });
  return out.sort((a, b) => (a.t === null) - (b.t === null) || a.t - b.t);
}

// The timeline grouped by day: [{date 'YYYY-MM-DD' | '', items}], in order ('' = no date, at the end)
export function tripDays() {
  const days = [];
  tripItems().forEach(it => {
    const date = it.t === null ? '' : ymd(new Date(it.t)), last = days[days.length - 1];
    if (last && last.date === date) last.items.push(it); else days.push({date, items: [it]});
  });
  return days;
}
export const upcomingTrip = () => tripItems().filter(it => !it.cancelled && it.t !== null && it.t > Date.now());

// The booking or meetup behind a trip id
export function tripEntry(id) {
  if (id.startsWith(MEETUP)) { const m = byMeetup(id.slice(MEETUP.length)); return m && joinedM(m) ? {kind: 'meetup', m} : null; }
  const b = getBooking(id);
  return b ? {kind: b.type, b} : null;
}
export const tripIdOfMeetup = m => MEETUP + m.id;
// Bookings can be changed or cancelled while they are confirmed and haven't started yet
export const isUpcoming = b => { const t = parseLocal(b.start); return t !== null && t > Date.now(); };
export const canChange = b => b.status === 'Confirmed' && isUpcoming(b) &&
  (b.type === 'flight' ? !!(b.details.from && b.details.to) : b.type === 'hotel' ? !!byHotel(b.details.hotelId) : !!(b.details.from && b.details.to));
export const canCancel = b => b.status === 'Confirmed' && (isUpcoming(b) || !b.start);

// ---------- Cancel ----------
// Free cancellation = full refund. Otherwise (non-refundable offer) a demo fee: everything but the taxes & fees.
// Taxis are free to cancel before the pick-up.
export function cancelTerms(b) {
  if (b.type === 'taxi') return {free: true, fee: 0, refund: b.price, text: 'Free cancellation before the pick-up time.'};
  if (b.details.freeCancel) return {free: true, fee: 0, refund: b.price, text: `Free cancellation with ${b.provider || 'this provider'}: you get the full amount back.`};
  const taxes = typeof b.details.taxes === 'number' ? b.details.taxes : 0, fee = r2(Math.max(0, b.price - taxes));
  return {free: false, fee, refund: r2(b.price - fee), text: `Non-refundable offer from ${b.provider || 'this provider'}: only the taxes & fees are refunded.`};
}
export function confirmCancel(ref) {
  const b = getBooking(ref); if (!b) return;
  const t = cancelTerms(b);
  cancelBooking(ref, {fee: t.fee, refund: t.refund});
  closeSheet(); emit();
  toast('Booking cancelled');
}

// ---------- Change ----------
// Change fees (demo): flights and hotels without free cancellation; taxis are free to change.
export const CHANGE_FEE = {flight: 25, hotel: 15, taxi: 0};
const err = e => ({err: e});

// Quote for changing booking b to v (flight {date}, hotel {checkIn, checkOut}, taxi {time 'YYYY-MM-DDTHH:MM'}):
// {price, fee, diff, note, changes} or {err}. Prices come from the same demo generators as the Book screens.
export function changeQuote(b, v) {
  const d = b.details, fee = d.freeCancel || b.type === 'taxi' ? 0 : CHANGE_FEE[b.type];
  const done = (price, changes, note = '') => ({price, fee, diff: r2(price + fee - b.price), note, changes: {...changes, price: r2(price + fee),
    details: {...changes.details, changeFee: r2((d.changeFee || 0) + fee), changes: (d.changes || 0) + 1}}});
  const todayIso = ymd(new Date());
  if (b.type === 'flight') {
    const date = v.date, toBerlin = d.to === 'BER', city = toBerlin ? d.from : d.to;
    if (!date) return err('Please pick a date.');
    if (date < todayIso) return err('That day has already passed – pick a day in the future.');
    if (b.start.slice(0, 10) === date) return err('That is the day you already booked – pick another day.');
    if (!CITIES.some(c => c[0] === city)) return err('This flight can\'t be changed in the demo.');
    const f = {city, toBerlin, date, pax: d.pax || 1, cls: d.cls || 'eco'};
    const t0 = parseLocal(b.start), dep0 = t0 ? new Date(t0).getHours() * 60 + new Date(t0).getMinutes() : 0;
    const list = flightResults(f), near = l => l.slice().sort((x, y) => Math.abs(x.dep - dep0) - Math.abs(y.dep - dep0))[0];
    const r = near(list.filter(x => x.airline === d.airline)) || near(list);
    if (!r) return err('No flight on that day – try another one.');
    const offers = flightOffers(r, f), o = offers.find(x => x.name === b.provider) || offers[0];
    if (isoAt(date, r.dep) <= toLocal(Date.now())) return err('That flight has already left – pick a later day.');
    return done(o.total, {provider: o.name, title: `${d.from} → ${d.to} · ${r.airline}`,
      sub: `${niceDate(date)}, ${hm(r.dep)} · ${f.pax} pax · ${d.passenger || ''}`.replace(/ · $/, ''),
      start: isoAt(date, r.dep), end: isoAt(date, r.arr),
      details: {...d, airline: r.airline, flightNo: r.no, stops: r.stop, fare: o.fare, bagFee: o.bagFee, bag: o.bag, freeCancel: o.free, taxes: o.taxes}},
      `${r.airline} ${r.no} at ${hm(r.dep)}` + (o.name !== b.provider ? ` · ${b.provider} has no offer, best price from ${o.name}` : ` · via ${o.name}`));
  }
  if (b.type === 'hotel') {
    const h = byHotel(d.hotelId), {checkIn, checkOut} = v;
    if (!h) return err('This hotel can\'t be changed in the demo.');
    if (!checkIn || !checkOut) return err('Please pick both dates.');
    if (checkIn < todayIso) return err('Check-in can\'t be in the past.');
    if (checkOut <= checkIn) return err('Check-out must be at least one night after check-in.');
    if (nightsOf(checkIn, checkOut) > 30) return err('Stays of up to 30 nights only.');
    if (checkIn === b.start.slice(0, 10) && checkOut === b.end.slice(0, 10)) return err('These are the dates you already booked.');
    const guests = d.guests || 2, offers = hotelOffers(h, {checkIn, checkOut, guests}), o = offers.find(x => x.name === b.provider) || offers[0];
    const nights = o.nights;
    return done(o.total, {provider: o.name, title: h.name,
      sub: `${niceDate(checkIn)} – ${niceDate(checkOut)} · ${nights} night${nights > 1 ? 's' : ''} · ${guests} guest${guests > 1 ? 's' : ''}${d.guest ? ' · ' + d.guest : ''}`,
      start: checkIn + 'T15:00', end: checkOut + 'T11:00',
      details: {...d, nights, rate: o.rate, room: o.room, taxes: o.taxes, breakfast: o.breakfast, freeCancel: o.free, units: o.units}},
      `${nights} night${nights > 1 ? 's' : ''} · ${o.name}` + (o.name !== b.provider ? ` (${b.provider} has no offer for these dates)` : ''));
  }
  // taxi: the fare depends on the distance only, so the price stays the same (demo)
  const t = parseLocal(v.time);
  if (t === null) return err('Please pick a pick-up time.');
  if (t < Date.now() + 5 * 6e4) return err('Pick a time at least 5 minutes from now.');
  if (t > Date.now() + 365 * 864e5) return err('Please pick a time within the next year.');
  if (toLocal(t) === b.start) return err('That is the time you already booked.');
  const ride = RIDES.find(r => r.id === d.ride) || RIDES[1], km = d.from && d.to ? roadKm(d.from, d.to) : 1, mins = Math.round(km * 2.6 + 4);
  const when = new Date(t).toLocaleString('en-GB', {weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});
  return done(r2(taxiFare(km) * ride.f), {title: b.title, sub: `${ride.name} · ${when}`, start: toLocal(t), end: toLocal(t + mins * 6e4), details: {...d}},
    `Pick-up ${when} · same fare (it depends on the distance only)`);
}
export function confirmChange(ref, q) {
  if (!q || q.err || !updateBooking(ref, q.changes)) return;
  closeSheet(); emit();
  toast('Booking changed');
}

// ---------- Directions ----------
// Start point: the hotel of the current or next stay (else the latest hotel booking), otherwise Alexanderplatz (central Berlin).
export function directionsStart() {
  const hotels = getBookings().filter(b => b.type === 'hotel' && b.status === 'Confirmed' && byHotel(b.details.hotelId));
  const now = Date.now(), cur = hotels.filter(b => (parseLocal(b.end) || 0) > now).sort((a, b) => (parseLocal(a.start) || 0) - (parseLocal(b.start) || 0))[0] || hotels[0];
  return cur ? {spot: hotelSpot(byHotel(cur.details.hotelId)), hotel: true, name: cur.title} : {spot: 'alex', hotel: false, name: spotName('alex')};
}
export const tripDayLabel = date => {
  if (!date) return 'Date not set';
  const dd = Math.round((new Date(date + 'T12:00') - new Date(ymd(new Date()) + 'T12:00')) / 864e5);
  return (dd === 0 ? 'Today · ' : dd === 1 ? 'Tomorrow · ' : dd === -1 ? 'Yesterday · ' : '') + niceDate(date);
};
