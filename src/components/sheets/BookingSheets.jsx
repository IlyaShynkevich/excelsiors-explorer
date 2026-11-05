import { useState } from 'react';
import { ui, openSheet, closeSheet } from '../../state/appStore.js';
import { bookFlight, bookHotel, flightRoute, setBookView } from '../../state/booking.js';
import { openBooking } from '../../hooks/useHashRouter.js';
import { spotName } from '../../data/booking.js';
import { starText } from '../../data/hotels.js';
import { fmtEur, hm, niceDate, plural } from '../../lib/format.js';

// "Done" after a booking: back to the hub (replaces the step in the history, so back doesn't book again)
const toHub = () => { closeSheet(); setBookView('hub', {replace: true}); };

// Name field + error, shared by the flight and hotel confirmation
function useName() {
  const [name, setName] = useState(''), [err, setErr] = useState(false);
  return {name: name.trim(), err, setErr, input: props => <input className="field" autoComplete="name" value={name} onChange={e => setName(e.target.value)} {...props} />};
}

// r = flight, o = the chosen provider offer, cheapest = o was the cheapest offer in the list
export function FlightConfirmSheet({ r, o, cheapest }) {
  const n = useName();
  const f = ui.fl, [A, B] = flightRoute();
  const confirm = () => {
    if (!n.name) return n.setErr(true);
    const b = bookFlight(r, o, n.name, cheapest);
    openSheet('flightDone', {r, o, bookingRef: b.ref, A, B, date: f.date, toBerlin: f.toBerlin});
  };
  return (<>
    <h3>Confirm your flight</h3>
    <p>{`${r.airline} ${r.no} · ${A} → ${B}`}</p>
    <div className="summary" id="flBreakdown">
      <div><span>Provider</span><span><b>{o.name}</b>{cheapest && <span className="fl-badge sum-badge">Cheapest</span>}</span></div>
      <div><span>Date</span><span>{niceDate(f.date)}</span></div>
      <div><span>Departure → Arrival</span><span>{`${hm(r.dep)} → ${hm(r.arr)}`}</span></div>
      <div><span>Base fare</span><span>{`${f.pax} × ${fmtEur(o.fare)}`}</span></div>
      <div><span>Taxes & fees</span><span>{fmtEur(o.taxes)}</span></div>
      <div><span>Checked baggage</span><span>{o.bag ? (o.bagFee ? `${f.pax} × ${fmtEur(o.bagFee)}` : 'Included') : 'Not included'}</span></div>
      <div><span>Cancellation</span><span>{o.free ? 'Free cancellation' : 'Non-refundable'}</span></div>
      <div className="tot"><span>Total</span><span>{fmtEur(o.total)}</span></div>
    </div>
    <div className="fgroup"><label htmlFor="paxName">Lead passenger name</label>{n.input({id: 'paxName', placeholder: 'As shown on your passport'})}</div>
    <div className="err" id="paxErr" style={n.err ? {display: 'block'} : undefined}>Please enter the passenger name.</div>
    <button className="btn" id="flConfirm" onClick={confirm}>Confirm booking</button>
    <button className="btn ghost" onClick={() => closeSheet()}>Cancel</button>
    <p className="demo">No payment is taken – this is a demo. The provider is fictional.</p>
  </>);
}

export function FlightDoneSheet({ r, o, bookingRef, A, B, date, toBerlin }) {
  const taxiFromBer = () => { ui.tx.from = 'ber'; closeSheet(); openBooking('taxi'); };
  return (<>
    <div className="big-emoji">✅</div>
    <div className="kicker">Booking confirmed</div>
    <h3>Have a great flight!</h3>
    <p>{`${r.airline} ${r.no}, ${A} → ${B}`}<br />{`${niceDate(date)} at ${hm(r.dep)}`}{o && <><br />{`Booked via ${o.name} · ${fmtEur(o.total)}`}</>}</p>
    <div className="ref">{bookingRef}</div>
    <p>Your booking reference</p>
    {toBerlin && <button className="btn" onClick={taxiFromBer}>🚕 Book a taxi from BER</button>}
    <button className="btn ghost" id="toHub" onClick={toHub}>Done</button>
  </>);
}

// h = hotel, o = the chosen provider offer
export function HotelConfirmSheet({ h, o, cheapest }) {
  const n = useName();
  const s = ui.ht, unit = h.stars ? 'room' : 'bed';
  const confirm = () => {
    if (!n.name) return n.setErr(true);
    const b = bookHotel(h, o, n.name, cheapest);
    openSheet('hotelDone', {h, o, bookingRef: b.ref, checkIn: s.checkIn, checkOut: s.checkOut});
  };
  return (<>
    <h3>Confirm your stay</h3>
    <p>{`${h.name} · ${starText(h)}`}</p>
    <div className="summary" id="htBreakdown">
      <div><span>Provider</span><span><b>{o.name}</b>{cheapest && <span className="fl-badge sum-badge">Cheapest</span>}</span></div>
      <div><span>Dates</span><span>{`${niceDate(s.checkIn)} → ${niceDate(s.checkOut)}`}</span></div>
      <div><span>Guests</span><span>{`${plural(s.guests, 'guest')} · ${plural(o.units, unit)}`}</span></div>
      <div><span>{o.units > 1 ? (h.stars ? 'Rooms' : 'Beds') + ' × nights × rate' : 'Nights × rate'}</span><span>{`${o.units > 1 ? o.units + ' × ' : ''}${o.nights} × ${fmtEur(o.rate)}`}</span></div>
      <div><span>Taxes & fees</span><span>{fmtEur(o.taxes)}</span></div>
      <div><span>Breakfast</span><span>{o.breakfast ? 'Included' : 'Not included'}</span></div>
      <div><span>Cancellation</span><span>{o.free ? 'Free cancellation' : 'Non-refundable'}</span></div>
      <div className="tot"><span>Total</span><span>{fmtEur(o.total)}</span></div>
    </div>
    <div className="fgroup"><label htmlFor="guestName">Guest name</label>{n.input({id: 'guestName', placeholder: 'Name for the reservation'})}</div>
    <div className="err" id="guestErr" style={n.err ? {display: 'block'} : undefined}>Please enter the guest name.</div>
    <button className="btn" id="htConfirm" onClick={confirm}>Confirm booking</button>
    <button className="btn ghost" onClick={() => closeSheet()}>Cancel</button>
    <p className="demo">No payment is taken – this is a demo. Taxes include the Berlin City Tax; the provider is fictional.</p>
  </>);
}

export function HotelDoneSheet({ h, o, bookingRef, checkIn, checkOut }) {
  return (<>
    <div className="big-emoji">✅</div>
    <div className="kicker">Booking confirmed</div>
    <h3>Enjoy your stay!</h3>
    <p>{h.name}<br />{`${niceDate(checkIn)} – ${niceDate(checkOut)} · ${plural(o.nights, 'night')}`}<br />{`Booked via ${o.name} · ${fmtEur(o.total)}`}</p>
    <div className="ref">{bookingRef}</div>
    <p>Your booking reference</p>
    <button className="btn" id="toHub" onClick={toHub}>Done</button>
  </>);
}

export function TaxiScheduledSheet({ from, to, rideName, when, bookingRef }) {
  return (<>
    <div className="big-emoji">🗓️</div><div className="kicker">Taxi scheduled</div><h3>{spotName(to)}</h3>
    <p>{`${rideName} · pick-up ${when}`}<br />{'from ' + spotName(from)}</p><div className="ref">{bookingRef}</div>
    <button className="btn" id="toHub" onClick={toHub}>Done</button>
  </>);
}
