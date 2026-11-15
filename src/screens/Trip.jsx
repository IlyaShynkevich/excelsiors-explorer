import { useEffect, useState } from 'react';
import { ui, openSheet } from '../state/appStore.js';
import { tripDays, tripEntry, timeOf, dayLabel, tripDayLabel, parseLocal, canChange, canCancel, cancelTerms } from '../state/trip.js';
import { going } from '../state/meetups.js';
import { weather, loadWeather, forecastFor, isRainy } from '../state/weather.js';
import { go, openTripItem, openMeetup, openChat } from '../hooks/useHashRouter.js';
import { useClock } from '../hooks/useClock.js';
import { wmo } from '../data/weather.js';
import { RIDES, spotName } from '../data/booking.js';
import { byHotel, hotelSpot, shortHotelName } from '../data/hotels.js';
import { byId } from '../data/places.js';
import { fmtEur, ymd, plural } from '../lib/format.js';
import { AppBar } from '../components/AppBar.jsx';
import { HereAction } from '../components/HereAction.jsx';
import { arrive } from '../state/challenges.js';
import { SkelCards } from '../components/Skeleton.jsx';
import { Bell, Navigation, MessageCircle, MapPin } from 'lucide-react';
import { KIND_ICONS, wxIcon } from '../components/Icons.jsx';
import { WeatherStrip } from '../components/WeatherStrip.jsx';
import { unreadCount } from '../state/reminders.js';
import { Tag } from '../components/Tag.jsx';

// While the forecast is still loading, the timeline waits up to WX_WAIT ms (card skeletons), so the day headers show
// their weather chips at once; a forecast that comes later only fills the chips (same line, no jump).
// Rain is shown once: the tinted chip in the day header, and one "Rainy: try indoor places" card in the forecast below.
const WX_WAIT = 800;
const wxSettled = () => weather.status === 'live' || weather.status === 'demo';

// ---------- Trip overview (EE-38): bookings + joined meetups, one timeline grouped by day ----------
export function Trip() {
  useClock();
  const [waited, setWaited] = useState(false);
  useEffect(() => { loadWeather(); const t = setTimeout(() => setWaited(true), WX_WAIT); return () => clearTimeout(t); }, []);
  const show = wxSettled() || waited;
  const days = tripDays(), unread = unreadCount();
  return (
    <section className="screen active" id="trip">
      <AppBar title="Trip">
        <button className="ab-icon bell" id="tripBell" aria-label={'Reminders' + (unread ? `, ${unread} unread` : '')} onClick={() => go('reminders')}>
          <Bell size={22} aria-hidden="true" />{unread > 0 && <span className="bell-n">{unread > 9 ? '9+' : unread}</span>}</button>
      </AppBar>
      <div className="scroll">
        <h1 className="ltitle">Trip</h1>
        {!show && days.length ? <SkelCards n={Math.min(days.length + 1, 3)} /> : days.length ? <>
          <div className="stagger" id="tripDays">{days.map(d => <TripDay key={d.date || 'none'} {...d} />)}</div>
          <WeatherStrip />
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
  return (
    <section className={'tr-day' + (past ? ' past' : '')} data-date={date}>
      <div className="tr-day-head">
        <h2>{tripDayLabel(date)}</h2>
        {f && <DayWeather f={f} />}
      </div>
      <div className="tr-list">{items.map(it => <TripRow key={it.key} it={it} />)}</div>
    </section>
  );
}

function DayWeather({ f }) {
  const [, label] = wmo(f.code), Icon = wxIcon(f.code);
  return (
    <span className={'tr-wx' + (isRainy(f) ? ' rainy' : '')} role="img" aria-label={`${label}, high ${f.hi}°, low ${f.lo}°, ${f.rain}% chance of rain`}>
      <Icon size={16} aria-hidden="true" /><b>{f.hi}°</b>{` ${f.lo}°`}
    </span>
  );
}

// One row: time · icon · short title, one sub line; a tag only when the item is not in its normal state
// (Cancelled, Hosting). The icon already says the kind, the provider is in the detail.
const rowTitle = it => it.kind === 'hotel' ? shortHotelName(it.b.details.hotelId, it.title)
  : it.kind === 'taxi' && it.b.details.to ? 'To ' + spotName(it.b.details.to) : it.title;
const rowSub = it => {
  const d = it.b && it.b.details;
  if (it.kind === 'hotel') return [it.label, d.area && d.area.split(' · ')[0]].filter(Boolean).join(' · ');
  if (it.kind === 'flight') return [d.flightNo, d.airline].filter(Boolean).join(' · ') || it.label;
  if (it.kind === 'taxi') return it.label + (d.ride ? ' · ' + (RIDES.find(r => r.id === d.ride) || {name: 'Taxi'}).name : '');
  return it.sub;   // meetup: the place
};
function TripRow({ it }) {
  const tag = it.cancelled ? ['off', it.status] : it.status === 'Hosting' ? ['warn', 'Hosting'] : null;
  return (
    <button className={'tr-item' + (it.cancelled ? ' cancelled' : '')} data-kind={it.kind} onClick={() => openTripItem(it.id)}>
      <span className="tr-time">{it.t === null ? '–' : timeOf(it.t)}</span>
      <span className="tr-ic" aria-hidden="true">{(I => <I size={18} />)(KIND_ICONS[it.kind])}</span>
      <span className="tr-nm">
        <b>{rowTitle(it)}</b>
        <small className="tr-sub">{rowSub(it)}</small>
      </span>
      {tag && <Tag tone={tag[0]}>{tag[1]}</Tag>}
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
      <AppBar back="trip" title={e ? KIND[e.kind] : 'Trip'} />
      <div className="scroll" id="tripItemBody">
        <h1 className="ltitle">{e ? KIND[e.kind] : 'Trip'}</h1>
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
      <span className="tr-ic big" aria-hidden="true">{(I => <I size={26} />)(KIND_ICONS[b.type])}</span>
      <span className="tr-nm"><b>{b.title}</b>{cancelled && <Tag tone="off">{b.status}</Tag>}</span>
    </div>
    <p className="tr-label">Booking reference</p>
    <div className="ref" id="tripRef">{b.ref}</div>
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
      {b.type === 'taxi' && !cancelled && d.to && <button className={'btn' + (changeable ? ' ghost' : '')} id="tripArrived" onClick={() => arrive(d.to)}><MapPin size={18} aria-hidden="true" /> I've arrived</button>}
      {h && !cancelled && <div className="here-group"><HereAction spot={hotelSpot(h)} name={h.name} ghost={changeable} /></div>}
      {cancellable && <button className="btn ghost tr-danger" id="tripCancel" onClick={() => openSheet('cancelBooking', {bookingRef: b.ref})}>Cancel booking</button>}
    </div>
    {!cancelled && !changeable && !cancellable && <p className="hint tr-center">This booking has started, so it can't be changed.</p>}
  </>);
}

function MeetupItem({ m }) {
  const p = byId(m.placeId), g = going(m), past = m.start < Date.now();
  return (<>
    <div className="tr-head">
      <span className="tr-ic big" aria-hidden="true">{(I => <I size={26} />)(KIND_ICONS.meetup)}</span>
      <span className="tr-nm"><b>{m.title}</b>{m.host === 'me' && <Tag tone="warn">Hosting</Tag>}</span>
    </div>
    <div className="summary" id="tripSummary">
      <Row k="Place">{p ? p.name : '–'}</Row>
      {p && <Row k="Address">{p.addr}</Row>}
      <Row k="Time">{`${dayLabel(m.start)}, ${timeOf(m.start)}${past ? ' · started' : ''}`}</Row>
      <Row k="Going">{`${g.length} / ${m.max}`}</Row>
    </div>
    <div className="btns tr-btns">
      <button className="btn" onClick={() => openMeetup(m.id)}>Open meetup</button>
      {p && <button className="btn ghost" id="tripDirections" onClick={() => openSheet('directions', {to: p.id, name: p.name})}><Navigation size={18} aria-hidden="true" /> Directions</button>}
      <button className="btn ghost" onClick={() => openChat(m.id)}><MessageCircle size={18} aria-hidden="true" /> Group chat</button>
    </div>
  </>);
}
