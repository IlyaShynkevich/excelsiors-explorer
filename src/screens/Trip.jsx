import { useEffect } from 'react';
import { ui, openSheet } from '../state/appStore.js';
import { tripDays, upcomingTrip, tripEntry, TRIP_ICONS, timeOf, dayLabel, tripDayLabel, parseLocal, canChange, canCancel, cancelTerms } from '../state/trip.js';
import { going } from '../state/meetups.js';
import { weather, loadWeather, forecastFor, isRainy } from '../state/weather.js';
import { go, openTripItem, openMeetup, openChat } from '../hooks/useHashRouter.js';
import { useClock } from '../hooks/useClock.js';
import { wmo } from '../data/weather.js';
import { RIDES, spotName } from '../data/booking.js';
import { byHotel, hotelSpot } from '../data/hotels.js';
import { byId } from '../data/places.js';
import { fmtEur, ymd, plural } from '../lib/format.js';
import { AppBar } from '../components/AppBar.jsx';
import { HereAction } from '../components/HereAction.jsx';
import { arrive } from '../state/challenges.js';

// ---------- Trip overview (EE-38): bookings + joined meetups, one timeline grouped by day ----------
export function Trip() {
  useClock();
  useEffect(() => { loadWeather(); }, []);
  const days = tripDays(), next = upcomingTrip().length;
  return (
    <section className="screen active" id="trip">
      <AppBar back="home">Excelsior Explorer</AppBar>
      <div className="scroll">
        <h1 className="ltitle">My Trip</h1>
        {days.length ? <>
          <p className="hint" id="tripCount">{next ? `${plural(next, 'upcoming plan')} · tap one for details` : 'Nothing coming up · your past plans are below'}</p>
          <div className="stagger" id="tripDays">{days.map(d => <TripDay key={d.date || 'none'} {...d} />)}</div>
          <p className="demo">Bookings, prices and meetups are demo data. Weather: forecast for Berlin.</p>
        </> : (
          <div className="empty" id="tripEmpty">
            <div className="empty-ico" aria-hidden="true">🧳</div>
            <b>No plans yet</b>
            <p>Your flights, hotels, taxis and joined meetups will show up here, day by day.</p>
            <div className="tr-empty-btns">
              <button className="btn" onClick={() => go('explore')}>Explore Berlin</button>
              <button className="btn ghost" onClick={() => go('book')}>Book a flight, hotel or taxi</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TripDay({ date, items }) {
  const past = date && date < ymd(new Date()), f = date && !past ? forecastFor(date) : null;
  const loaded = weather.status === 'live' || weather.status === 'demo';
  return (
    <section className={'tr-day' + (past ? ' past' : '')} data-date={date}>
      <div className="tr-day-head">
        <h3>{tripDayLabel(date)}</h3>
        {f ? <DayWeather f={f} /> : date && !past && loaded && <small className="tr-wx-note">Forecast available closer to the trip</small>}
      </div>
      {f && isRainy(f) && (
        <button className="wx-hint tr-rain" onClick={() => go('explore', {cats: ['museums']})}>
          <span aria-hidden="true">🌧️</span>
          <span><b>Rainy: try indoor places</b><small>{`${f.rain}% chance of rain · see museums`}</small></span>
        </button>
      )}
      <div className="tr-list">{items.map(it => <TripRow key={it.key} it={it} />)}</div>
    </section>
  );
}

function DayWeather({ f }) {
  const [ico, label] = wmo(f.code);
  return (
    <span className={'tr-wx' + (isRainy(f) ? ' rainy' : '')} aria-label={`${label}, high ${f.hi}°, low ${f.lo}°, ${f.rain}% chance of rain`}>
      <span aria-hidden="true">{ico}</span><b>{f.hi}°</b>{` ${f.lo}° · 💧${f.rain}%`}
      {weather.status === 'demo' && <span className="demo-tag">Demo</span>}
    </span>
  );
}

function TripRow({ it }) {
  const st = it.cancelled ? 'off' : it.kind === 'meetup' ? 'mt' : 'ok';
  return (
    <button className={'tr-item' + (it.cancelled ? ' cancelled' : '')} data-kind={it.kind} onClick={() => openTripItem(it.id)}>
      <span className="tr-time">{it.t === null ? '–' : timeOf(it.t)}</span>
      <span className="tr-ic" aria-hidden="true">{TRIP_ICONS[it.kind]}</span>
      <span className="tr-nm">
        <span className="tr-top"><small>{it.label}</small><span className={'tr-st ' + st}>{it.status}</span></span>
        <b>{it.title}</b>
        {it.sub && <small className="tr-sub">{it.sub}</small>}
      </span>
    </button>
  );
}

// ---------- Detail (#trip/<id>) ----------
const KIND = {flight: 'Flight', hotel: 'Hotel', taxi: 'Taxi', meetup: 'Meetup'};
export function TripItem() {
  useClock();
  const e = tripEntry(ui.tripId);
  return (
    <section className="screen active" id="tripItem">
      <AppBar back="trip">My Trip</AppBar>
      <div className="scroll" id="tripItemBody">
        <h1 className="ltitle">{e ? KIND[e.kind] : 'My Trip'}</h1>
        {!e ? <div className="empty"><p>This trip item no longer exists.</p><button className="link-btn" onClick={() => go('trip', {replace: true})}>Show my trip</button></div>
          : e.kind === 'meetup' ? <MeetupItem m={e.m} /> : <BookingItem b={e.b} />}
      </div>
    </section>
  );
}

const when = s => { const t = parseLocal(s); return t === null ? '–' : `${dayLabel(t)}, ${timeOf(t)}`; };
const Row = ({ k, children }) => <div><span>{k}</span><span>{children}</span></div>;

function BookingItem({ b }) {
  const d = b.details, cancelled = b.status === 'Cancelled', changeable = canChange(b), cancellable = canCancel(b);
  const h = b.type === 'hotel' && byHotel(d.hotelId), terms = !cancelled && cancelTerms(b);
  const freeText = b.type === 'taxi' ? 'Free before pick-up' : d.freeCancel ? 'Free cancellation' : 'Non-refundable';
  return (<>
    <div className="tr-head" data-kind={b.type}>
      <span className="tr-ic big" aria-hidden="true">{TRIP_ICONS[b.type]}</span>
      <span className="tr-nm"><b>{b.title}</b><span className={'tr-st ' + (cancelled ? 'off' : 'ok')}>{b.status}</span></span>
    </div>
    <div className="ref" id="tripRef">{b.ref}</div>
    <p className="hint tr-center">Booking reference</p>
    <div className="summary" id="tripSummary">
      {b.type === 'flight' && d.from && <>
        <Row k="Route">{`${d.from} → ${d.to}`}</Row>
        <Row k="Flight">{`${d.airline || ''} ${d.flightNo || ''} · ${d.stops ? '1 stop' : 'Direct'}`}</Row>
        <Row k="Departure">{when(b.start)}</Row>
        <Row k="Arrival">{when(b.end)}</Row>
        <Row k="Passengers">{`${d.pax || 1} · ${d.cls === 'biz' ? 'Business' : 'Economy'}${d.passenger ? ' · ' + d.passenger : ''}`}</Row>
        <Row k="Baggage">{d.bag ? 'Checked bag included' : 'Cabin bag only'}</Row>
      </>}
      {b.type === 'hotel' && <>
        <Row k="Address">{`${d.area || ''}${d.area ? ', ' : ''}Berlin`}</Row>
        <Row k="Check-in">{when(b.start)}</Row>
        <Row k="Check-out">{when(b.end)}</Row>
        <Row k="Stay">{`${plural(d.nights || 1, 'night')} · ${plural(d.guests || 1, 'guest')}${d.guest ? ' · ' + d.guest : ''}`}</Row>
        <Row k="Breakfast">{d.breakfast ? 'Included' : 'Not included'}</Row>
      </>}
      {b.type === 'taxi' && d.from && <>
        <Row k="Route">{`${spotName(d.from)} → ${spotName(d.to)}`}</Row>
        <Row k="Pick-up">{when(b.start)}</Row>
        <Row k="Ride">{(RIDES.find(r => r.id === d.ride) || {name: 'Taxi'}).name}</Row>
        {d.km > 0 && <Row k="Distance">{`≈ ${String(d.km).replace('.', ',')} km`}</Row>}
      </>}
      {!d.from && !d.hotelId && <Row k="Details">{b.sub}</Row>}
      <Row k="Provider">{b.provider || (b.type === 'taxi' ? 'Berlin taxi (demo)' : '–')}</Row>
      <Row k="Cancellation">{freeText}</Row>
      {d.changes > 0 && <Row k="Changed">{`${plural(d.changes, 'time')}${d.changeFee ? ' · fees ' + fmtEur(d.changeFee) : ''}`}</Row>}
      <Row k="Status">{b.status}</Row>
      {cancelled ? <>
        {typeof d.paid === 'number' && <Row k="Paid">{fmtEur(d.paid)}</Row>}
        {d.cancelFee > 0 && <Row k="Cancellation fee (demo)">{fmtEur(d.cancelFee)}</Row>}
        <div className="tot"><span>Refund</span><span>{fmtEur(typeof d.refund === 'number' ? d.refund : 0)}</span></div>
      </> : <div className="tot"><span>{b.type === 'taxi' ? 'Estimated fare' : 'Total'}</span><span>{fmtEur(b.price)}</span></div>}
    </div>
    <div className="btns tr-btns">
      {changeable && <button className="btn" id="tripChange" onClick={() => openSheet('changeBooking', {bookingRef: b.ref})}>Change booking</button>}
      {b.type === 'taxi' && !cancelled && d.to && <button className="btn" id="tripArrived" onClick={() => arrive(d.to)}>📍 I've arrived</button>}
      {h && !cancelled && <HereAction spot={hotelSpot(h)} name={h.name} />}
      {h && !cancelled && <button className="btn ghost" id="tripDirections" onClick={() => openSheet('directions', {to: hotelSpot(h), name: h.name})}>🧭 Directions</button>}
      {cancellable && <button className="btn ghost tr-danger" id="tripCancel" onClick={() => openSheet('cancelBooking', {bookingRef: b.ref})}>Cancel booking</button>}
    </div>
    {cancelled ? <p className="hint tr-center">This booking was cancelled. It stays in your trip and in My bookings.</p>
      : !changeable && !cancellable ? <p className="hint tr-center">This booking has started or is in the past, so it can't be changed any more.</p>
      : terms && <p className="hint tr-center">{terms.free ? 'Free cancellation: full refund.' : `Cancelling costs a demo fee of ${fmtEur(terms.fee)}.`}</p>}
    <p className="demo">Demo: no real booking, payment or refund. The provider is fictional.</p>
  </>);
}

function MeetupItem({ m }) {
  const p = byId(m.placeId), g = going(m), past = m.start < Date.now();
  return (<>
    <div className="tr-head">
      <span className="tr-ic big" aria-hidden="true">👥</span>
      <span className="tr-nm"><b>{m.title}</b><span className="tr-st mt">{m.host === 'me' ? 'Hosting' : 'Joined'}</span></span>
    </div>
    <div className="summary" id="tripSummary">
      <Row k="Place">{p ? p.name : '–'}</Row>
      {p && <Row k="Address">{p.addr}</Row>}
      <Row k="Time">{`${dayLabel(m.start)}, ${timeOf(m.start)}${past ? ' · started' : ''}`}</Row>
      <Row k="Going">{`${g.length} / ${m.max}`}</Row>
    </div>
    <div className="btns tr-btns">
      <button className="btn" onClick={() => openMeetup(m.id)}>Open meetup</button>
      {p && <button className="btn ghost" id="tripDirections" onClick={() => openSheet('directions', {to: p.id, name: p.name})}>🧭 Directions</button>}
      <button className="btn ghost" onClick={() => openChat(m.id)}>💬 Group chat</button>
    </div>
    <p className="demo">Demo: meetups and the group chat are simulated.</p>
  </>);
}
