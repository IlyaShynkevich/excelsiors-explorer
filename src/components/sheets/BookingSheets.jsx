import { useState } from 'react';
import { ui, openSheet, closeSheet } from '../../state/appStore.js';
import { bookFlight, flightRoute, flightTax, setBookView } from '../../state/booking.js';
import { openBooking } from '../../hooks/useHashRouter.js';
import { spotName } from '../../data/booking.js';
import { fmtEur, hm, niceDate } from '../../lib/format.js';

const toHub = () => { closeSheet(); setBookView('hub'); };

export function FlightConfirmSheet({ r }) {
  const [name, setName] = useState('');
  const [err, setErr] = useState(false);
  const f = ui.fl, [A, B] = flightRoute(), tax = flightTax(), total = r.price * f.pax + tax;
  const confirm = () => {
    const n = name.trim();
    if (!n) return setErr(true);
    const ref = bookFlight(r, n);
    openSheet('flightDone', {r, bookingRef: ref, A, B, date: f.date, toBerlin: f.toBerlin});
  };
  return (<>
    <h3>Confirm your flight</h3>
    <p>{`${r.airline} ${r.no} · ${A} → ${B}`}</p>
    <div className="summary">
      <div><span>Date</span><span>{niceDate(f.date)}</span></div>
      <div><span>Departure → Arrival</span><span>{`${hm(r.dep)} → ${hm(r.arr)}`}</span></div>
      <div><span>Passengers</span><span>{`${f.pax} × ${fmtEur(r.price)}`}</span></div>
      <div><span>Taxes & fees</span><span>{fmtEur(tax)}</span></div>
      <div className="tot"><span>Total</span><span>{fmtEur(total)}</span></div>
    </div>
    <div className="fgroup"><label>Lead passenger name</label><input className="field" id="paxName" placeholder="As shown on your passport" autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></div>
    <div className="err" id="paxErr" style={err ? {display: 'block'} : undefined}>Please enter the passenger name.</div>
    <button className="btn" id="flConfirm" onClick={confirm}>Confirm booking</button>
    <button className="btn ghost" onClick={() => closeSheet()}>Cancel</button>
    <p className="demo">No payment is taken – this is a demo.</p>
  </>);
}

export function FlightDoneSheet({ r, bookingRef, A, B, date, toBerlin }) {
  const taxiFromBer = () => { ui.tx.from = 'ber'; closeSheet(); openBooking('taxi'); };
  return (<>
    <div className="big-emoji">✅</div>
    <div className="kicker">Booking confirmed</div>
    <h3>Have a great flight!</h3>
    <p>{`${r.airline} ${r.no}, ${A} → ${B}`}<br />{`${niceDate(date)} at ${hm(r.dep)}`}</p>
    <div className="ref">{bookingRef}</div>
    <p>Your booking reference</p>
    {toBerlin && <button className="btn" onClick={taxiFromBer}>🚕 Book a taxi from BER</button>}
    <button className="btn ghost" id="toHub" onClick={toHub}>Done</button>
  </>);
}

export function TaxiScheduledSheet({ from, to, rideName, when, bookingRef }) {
  return (<>
    <div className="big-emoji">🗓️</div><div className="kicker">Taxi scheduled</div><h3>{spotName(to)}</h3>
    <p>{`${rideName} · pick-up ${when}`}<br />{'from ' + spotName(from)}</p><div className="ref">{bookingRef}</div>
    <button className="btn" id="toHub" onClick={toHub}>Done</button>
  </>);
}
