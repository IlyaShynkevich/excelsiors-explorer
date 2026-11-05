import { useState } from 'react';
import { ui, closeSheet } from '../../state/appStore.js';
import { getBooking } from '../../state/userData.js';
import { changeQuote, confirmChange, cancelTerms, confirmCancel, directionsStart, toLocal } from '../../state/trip.js';
import { openBooking } from '../../hooks/useHashRouter.js';
import { directions, spotName, DETOUR } from '../../data/booking.js';
import { fmtEur, ymd, addDays } from '../../lib/format.js';

const km1 = n => n.toFixed(1).replace('.', ',');
const mins = m => m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`;
const diffText = d => d > 0.004 ? `+${fmtEur(d)} to pay` : d < -0.004 ? `${fmtEur(-d)} back` : 'No difference';

// ---------- Change booking: another day (flight), other dates (hotel) or another time (taxi) ----------
export function ChangeBookingSheet({ bookingRef }) {
  const b = getBooking(bookingRef);
  const [v, setV] = useState(() => !b ? {} : b.type === 'flight' ? {date: b.start.slice(0, 10)}
    : b.type === 'hotel' ? {checkIn: b.start.slice(0, 10), checkOut: b.end.slice(0, 10)} : {time: b.start});
  const [touched, setTouched] = useState(false);
  if (!b || b.status !== 'Confirmed') return <><h3>This booking can't be changed</h3><button className="btn ghost" onClick={() => closeSheet()}>Close</button></>;
  const set = k => e => { setV(s => ({...s, [k]: e.target.value})); setTouched(true); };
  const q = touched ? changeQuote(b, v) : null, todayIso = ymd(new Date());
  const field = (id, label, k, props) => <div className="fgroup"><label htmlFor={id}>{label}</label>
    <input className="field" id={id} value={v[k] || ''} onChange={set(k)} {...props} /></div>;
  return (<>
    <h3>Change booking</h3>
    <p>{b.title}<br />{'Now: ' + b.sub}</p>
    {b.type === 'flight' && field('chDate', 'New travel day', 'date', {type: 'date', min: todayIso})}
    {b.type === 'hotel' && <div className="row2">
      {field('chIn', 'Check-in', 'checkIn', {type: 'date', min: todayIso})}
      {field('chOut', 'Check-out', 'checkOut', {type: 'date', min: v.checkIn ? addDays(v.checkIn, 1) : todayIso})}
    </div>}
    {b.type === 'taxi' && field('chTime', 'New pick-up time', 'time', {type: 'datetime-local', min: toLocal(Date.now() + 5 * 6e4)})}
    {!q ? <p className="hint ch-hint">{b.type === 'taxi' ? 'Pick a new time to see the price.' : 'Pick new dates to see the price difference.'}</p>
      : q.err ? <div className="err" id="chErr" style={{display: 'block'}}>{q.err}</div>
      : <div className="summary" id="chSummary">
          <div><span>New</span><span>{q.note}</span></div>
          <div><span>Current price</span><span>{fmtEur(b.price)}</span></div>
          <div><span>New price</span><span>{fmtEur(q.price)}</span></div>
          {q.fee > 0 && <div><span>Change fee (demo)</span><span>{fmtEur(q.fee)}</span></div>}
          <div className="tot"><span>Price difference</span><span id="chDiff">{diffText(q.diff)}</span></div>
        </div>}
    <button className="btn" id="chConfirm" disabled={!q || !!q.err} onClick={() => confirmChange(b.ref, q)}>Confirm change</button>
    <button className="btn ghost" onClick={() => closeSheet()}>Keep current booking</button>
    <p className="demo">Demo prices: no payment is taken and nothing is refunded.</p>
  </>);
}

// ---------- Cancel booking: the refund terms of the booked provider offer ----------
export function CancelBookingSheet({ bookingRef }) {
  const b = getBooking(bookingRef);
  if (!b || b.status !== 'Confirmed') return <><h3>This booking is already cancelled</h3><button className="btn ghost" onClick={() => closeSheet()}>Close</button></>;
  const t = cancelTerms(b);
  return (<>
    <div className="big-emoji">🗑️</div>
    <h3>Cancel this booking?</h3>
    <p>{b.title}<br />{b.sub}</p>
    <div className="summary" id="cxSummary">
      <div><span>Provider</span><span>{b.provider || 'Berlin taxi (demo)'}</span></div>
      <div><span>Terms</span><span>{t.free ? 'Free cancellation' : 'Non-refundable'}</span></div>
      <div><span>Paid</span><span>{fmtEur(b.price)}</span></div>
      <div><span>Cancellation fee (demo)</span><span>{fmtEur(t.fee)}</span></div>
      <div className="tot"><span>Refund</span><span id="cxRefund">{fmtEur(t.refund)}</span></div>
    </div>
    <p>{t.text}</p>
    <button className="btn danger" id="cxConfirm" onClick={() => confirmCancel(b.ref)}>Cancel booking</button>
    <button className="btn ghost" onClick={() => closeSheet()}>Keep booking</button>
    <p className="demo">Demo: no money is moved, the refund is simulated.</p>
  </>);
}

// ---------- Directions (simulated): walking, public transport and taxi from the hotel or central Berlin ----------
// to = spot id (place id or 'ht-<hotel>'), name = shown name
export function DirectionsSheet({ to, name }) {
  const s0 = directionsStart(), start = s0.spot === to ? {spot: 'alex', hotel: false, name: spotName('alex')} : s0;
  const d = directions(start.spot, to);
  const taxi = () => { ui.tx.from = start.spot; closeSheet(); openBooking('taxi', to); };
  return (<>
    <h3>Directions</h3>
    <p>To <b>{name}</b><br />{(start.hotel ? `From your hotel, ${start.name}` : `From ${start.name} (central Berlin)`) + ` · ${km1(d.km)} km away`}</p>
    <div id="dirOpts">
      <div className="ride dir" data-mode="walk"><span className="ic" aria-hidden="true">🚶</span>
        <span className="nm"><b>Walking</b><small>{`about ${km1(d.km * DETOUR)} km on foot`}</small></span><span className="pr">{mins(d.walk)}</span></div>
      <div className="ride dir" data-mode="transit"><span className="ic" aria-hidden="true">🚇</span>
        <span className="nm"><b>Public transport</b><small>{`U-Bahn / S-Bahn / bus, approx. ${d.transit} min (demo estimate)`}</small></span><span className="pr">{mins(d.transit)}</span></div>
      <div className="ride dir" data-mode="taxi"><span className="ic" aria-hidden="true">🚕</span>
        <span className="nm"><b>Taxi</b><small>{`approx. ${d.taxi} min · Berlin taxi tariff`}</small></span><span className="pr">{fmtEur(d.fare)}</span></div>
    </div>
    <button className="btn" id="dirTaxi" onClick={taxi}>🚕 Get a taxi here</button>
    <button className="btn ghost" onClick={() => closeSheet()}>Close</button>
    <p className="demo">Simulated directions: estimates from the straight-line distance, no live routes or timetables.</p>
  </>);
}
