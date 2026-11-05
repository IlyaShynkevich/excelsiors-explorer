import { useRef, useState } from 'react';
import { ui, emit, toast, openSheet } from '../state/appStore.js';
import { setBookView, flightRoute, requestTaxi, cancelRide, getBookings, BOOK_PARENT, flightList, setFlightSort, toggleFilter, resetFilters,
         FLIGHT_FILTERS, HOTEL_SORTS, HOTEL_FILTERS, hotelList, hotelOffersFor, hotelNights, hotelCityName, setHotelSort, setHotelDates, openHotel } from '../state/booking.js';
import { go, goBack, openTripItem } from '../hooks/useHashRouter.js';
import { useFlip } from '../hooks/useFlip.js';
import { CITIES, EXTRA_SPOTS, RIDES, roadKm, taxiFare, spotName } from '../data/booking.js';
import { HOTELS, byHotel, starText, hotelUnits, hotelSpot } from '../data/hotels.js';
import { PLACES } from '../data/places.js';
import { fmtEur, hm, dur, niceDate, tomorrow, today, addDays, plural } from '../lib/format.js';
import { BackButton } from '../components/AppBar.jsx';
import { Stepper } from '../components/Stepper.jsx';
import { FilterChips } from '../components/FilterChips.jsx';
import { ProviderList } from '../components/ProviderList.jsx';
import { Photo } from '../components/Photo.jsx';

const TITLES = {hub:'Book', flights:'Book a flight', results:'Choose a flight', taxi:'Book a taxi', ride:'Your ride',
                hotels:'Book a hotel', hotelResults:'Choose a hotel', hotel:'Your stay'};
const VIEWS = {hub: Hub, flights: FlightForm, results: FlightResults, taxi: TaxiForm, ride: Ride, hotels: HotelForm, hotelResults: HotelResults, hotel: HotelDetail};
const notInPrototype = what => toast(what + ' (not in prototype)');
const ICONS = {flight:'✈️', hotel:'🏨', taxi:'🚕'};

// Booking hub with the flight, hotel and taxi flows (ui.bookView; each step has its own #book/… URL).
// The back button goes back in the browser history, or to the previous step when there is none.
export function Book() {
  const v = ui.bookView, View = VIEWS[v], box = useRef(null);
  return (
    <section className="screen active" id="book">
      <div className="appbar">
        <BackButton id="bookBack" style={v === 'hub' ? {display: 'none'} : undefined} onClick={() => goBack(() => setBookView(BOOK_PARENT[v] || 'hub'))} />
        Excelsior Explorer
      </div>
      <div className="scroll" ref={box}>
        <h1 className="ltitle" id="bookTitle">{TITLES[v]}</h1>
        <div id="bookBody" key={v}><View box={box} /></div>
      </div>
    </section>
  );
}

function Hub() {
  const list = getBookings();
  return (<>
    <div className="bk-hero">
      <button className="bk-tile" style={{background: 'linear-gradient(145deg,#3b82f6,#1e3a8a)'}} onClick={() => setBookView('flights')}><span className="em">✈️</span><span><b>Flights</b><small>To & from Berlin BER</small></span></button>
      <button className="bk-tile" id="hotelTile" style={{background: 'linear-gradient(145deg,#f472b6,#9d174d)'}} onClick={() => setBookView('hotels')}><span className="em">🏨</span><span><b>Hotels</b><small>Compare prices in Berlin</small></span></button>
      <button className="bk-tile wide" style={{background: 'linear-gradient(145deg,#facc15,#ca8a04)'}} onClick={() => setBookView('taxi')}><span className="em">🚕</span><span><b>Taxi</b><small>Anywhere in Berlin</small></span></button>
    </div>
    <div className="sec-row"><h3 className="sec">My bookings</h3><button className="link-btn" id="toTrip" onClick={() => go('trip')}>Trip overview</button></div>
    {list.length ? <div className="stagger" id="myBookings">{list.map(b => (
      <button className={'bk-item' + (b.status === 'Cancelled' ? ' cancelled' : '')} key={b.ref + b.created} data-type={b.type} onClick={() => openTripItem(b.ref)}><span className="ic">{ICONS[b.type]}</span>
        <span className="nm"><b>{b.title}</b><small>{b.sub}</small>
          {b.provider && <small className="via">{`via ${b.provider} · ${b.status}`}</small>}</span>
        <span className="amt"><b>{fmtEur(b.price)}</b><br /><span className="st">{b.ref}</span></span></button>
    ))}</div> : <p className="hint">No bookings yet. Book a flight to Berlin or grab a taxi to your next sight!</p>}
  </>);
}

function FlightForm() {
  const f = ui.fl;
  const citySel = <select className="field" id="flCity" defaultValue={f.city} onChange={e => f.city = e.target.value}>
    {CITIES.map(x => <option key={x[0]} value={x[0]}>{`${x[1]} (${x[0]})`}</option>)}</select>;
  const ber = <div className="fixed">Berlin (BER)</div>;
  const pax = n => { f.pax = n; emit(); };
  return (<>
    <div className="seg"><button className="on">One way</button><button onClick={() => notInPrototype('Round trips')}>Round trip</button></div>
    <div className="route">
      <div className="fgroup"><label>From</label>{f.toBerlin ? citySel : ber}</div>
      <button className="swap" id="flSwap" aria-label="Swap" onClick={() => { f.toBerlin = !f.toBerlin; emit(); }}>⇄</button>
      <div className="fgroup"><label>To</label>{f.toBerlin ? ber : citySel}</div>
    </div>
    <div className="row2">
      <div className="fgroup"><label>Date</label><input className="field" type="date" id="flDate" defaultValue={f.date} min={today()} onChange={e => f.date = e.target.value || tomorrow()} /></div>
      <div className="fgroup"><label>Passengers</label>
        <Stepper value={f.pax} onMinus={() => pax(Math.max(1, f.pax - 1))} onPlus={() => pax(Math.min(9, f.pax + 1))} ids={['paxMinus', 'paxN', 'paxPlus']} /></div>
    </div>
    <div className="fgroup"><label>Class</label><select className="field" id="flCls" defaultValue={f.cls} onChange={e => f.cls = e.target.value}>
      <option value="eco">Economy</option><option value="biz">Business</option></select></div>
    <button className="btn" id="flSearch" onClick={() => setBookView('results')}>Search flights</button>
    <p className="demo">Demo app – flights and prices are simulated.</p>
  </>);
}

const FL_SORTS = [['price', 'Cheapest'], ['fast', 'Fastest'], ['stops', 'Fewest stops']];
const SortSeg = ({ id, label, options, value, onChange }) => (
  <div className="seg seg-sm" id={id} role="group" aria-label={label}>{options.map(([k, l]) =>
    <button key={k} className={value === k ? 'on' : ''} aria-pressed={value === k} onClick={() => onChange(k)}>{l}</button>)}</div>
);

// Search results: every flight with its providers side by side (sort + filters in ui.fl)
function FlightResults({ box }) {
  const f = ui.fl, [A, B] = flightRoute(), list = flightList();
  const [open, setOpen] = useState({});   // flights whose full provider list is shown
  useFlip(box, '#flList > .fl, .empty', list.map(x => x.r.no + ':' + x.offers.length + (open[x.r.no] ? '+' : '')).join() + f.sort);
  const best = list.length ? Math.min(...list.map(x => x.offers[0].total)) : 0;
  return (<>
    <p className="hint">{`${A} → ${B} · ${niceDate(f.date)} · ${f.pax} passenger${f.pax > 1 ? 's' : ''} · ${f.cls === 'biz' ? 'Business' : 'Economy'}`}</p>
    <SortSeg id="flSort" label="Sort flights" options={FL_SORTS} value={f.sort} onChange={setFlightSort} />
    <FilterChips id="flFilters" label="Filter providers" options={FLIGHT_FILTERS} value={f.filters} onChange={k => toggleFilter('fl', k)} />
    {list.length ? <div className="stagger" id="flList">{list.map(({r, offers}) => (
      <div className="fl" key={r.no} data-flight={r.no}>
        <div className="air"><span><b>{r.airline}</b>{' · ' + r.no}</span>{offers[0].total === best && <span className="fl-badge">CHEAPEST</span>}</div>
        <div className="times">
          <div className="t">{hm(r.dep)}<small>{A}</small></div>
          <div className="line">{dur(r.d)}<br />{r.stop ? '1 stop' : 'Direct'}</div>
          <div className="t" style={{textAlign: 'right'}}>{hm(r.arr)}{r.arr >= 1440 && <sup>+1</sup>}<small>{B}</small></div>
        </div>
        <ProviderList offers={offers} kind="flight" limit={3} expanded={!!open[r.no]} onExpand={() => setOpen(o => ({...o, [r.no]: !o[r.no]}))}
                      onPick={(o, cheapest) => openSheet('flight', {r, o, cheapest})} />
      </div>
    ))}</div> : <div className="empty"><p>No provider offers match your filters.</p>
      <button className="link-btn" onClick={() => resetFilters('fl')}>Reset filters</button></div>}
    <p className="demo">Providers and prices are demo data: fictional booking sites, simulated prices.</p>
  </>);
}

// ---------- Hotels ----------
function HotelForm() {
  const s = ui.ht, n = hotelNights();
  const guests = g => { s.guests = g; emit(); };
  return (<>
    <div className="fgroup"><label htmlFor="htCity">City</label>
      <select className="field" id="htCity" value={s.city} onChange={e => { s.city = e.target.value; emit(); }}>
        <option value="BER">Berlin</option>
        <optgroup label="More cities (not in this demo yet)">{CITIES.map(c => <option key={c[0]} value={c[0]}>{c[1]}</option>)}</optgroup>
      </select></div>
    <div className="row2">
      <div className="fgroup"><label htmlFor="htIn">Check-in</label><input className="field" type="date" id="htIn" value={s.checkIn} min={today()} onChange={e => setHotelDates('checkIn', e.target.value)} /></div>
      <div className="fgroup"><label htmlFor="htOut">Check-out</label><input className="field" type="date" id="htOut" value={s.checkOut} min={addDays(s.checkIn, 1)} onChange={e => setHotelDates('checkOut', e.target.value)} /></div>
    </div>
    <div className="fgroup"><label>Guests</label>
      <Stepper value={s.guests} onMinus={() => guests(Math.max(1, s.guests - 1))} onPlus={() => guests(Math.min(8, s.guests + 1))} ids={['htMinus', 'htGuests', 'htPlus']} labels={['Fewer guests', 'More guests']} /></div>
    <p className="hint" id="htNights">{`${plural(n, 'night')} · ${niceDate(s.checkIn)} – ${niceDate(s.checkOut)} · up to 2 guests per room`}</p>
    <button className="btn" id="htSearch" onClick={() => setBookView('hotelResults')}>Search hotels</button>
    <p className="demo">Demo app – providers and prices are simulated (demo prices).</p>
  </>);
}

const searchLine = () => { const s = ui.ht; return `${hotelCityName()} · ${niceDate(s.checkIn)} – ${niceDate(s.checkOut)} · ${plural(hotelNights(), 'night')} · ${plural(s.guests, 'guest')}`; };

function HotelResults({ box }) {
  const s = ui.ht, list = hotelList();
  useFlip(box, '#htList > .ht-card, .empty', list.map(x => x.h.id).join() + s.sort);
  if (s.city !== 'BER') return (<>
    <p className="hint">{searchLine()}</p>
    <div className="empty" id="htNone"><p>{`Hotels in ${hotelCityName()} aren't in this demo yet – only Berlin.`}</p>
      <button className="link-btn" onClick={() => { s.city = 'BER'; emit(); }}>Show Berlin hotels</button></div>
  </>);
  const best = list.length ? Math.min(...list.map(x => x.offers[0].total)) : 0;
  return (<>
    <p className="hint">{searchLine()}</p>
    <SortSeg id="htSort" label="Sort hotels" options={HOTEL_SORTS} value={s.sort} onChange={setHotelSort} />
    <FilterChips id="htFilters" label="Filter hotels" options={HOTEL_FILTERS} value={s.filters} onChange={k => toggleFilter('ht', k)} />
    {list.length ? <div className="stagger" id="htList">{list.map(({h, offers}) => {
      const o = offers[0], save = offers[offers.length - 1].total - o.total;
      return (
        <button className="ht-card" key={h.id} data-hotel={h.id} onClick={() => openHotel(h.id)}>
          <Photo className="ht-ph" p={h}>{o.total === best && <span className="fl-badge">CHEAPEST</span>}</Photo>
          <span className="ht-body">
            <span className="ht-top"><b>{h.name}</b><span className="stars" aria-label={h.stars ? h.stars + ' stars' : 'Hostel'}>{starText(h)}</span></span>
            <small className="muted">{h.area}</small>
            <span className="ht-price"><span><b>{fmtEur(o.rate)}</b><small>{' / night · ' + o.name}</small></span>
              <span className="ht-tot">{fmtEur(o.total) + ' total'}</span></span>
            {offers.length > 1 && save >= 0.01 && <small className="save">{`${offers.length} providers · save ${fmtEur(save)} vs the most expensive`}</small>}
          </span>
        </button>
      );
    })}</div> : <div className="empty"><p>No hotels match your filters.</p>
      <button className="link-btn" onClick={() => resetFilters('ht')}>Reset filters</button></div>}
    <p className="demo">Demo prices: providers are fictional booking sites, prices are simulated.</p>
  </>);
}

const OFFER_FILTERS = HOTEL_FILTERS.filter(([k]) => k === 'free' || k === 'breakfast');
function HotelDetail() {
  const s = ui.ht, h = byHotel(s.sel);
  if (!h) return <div className="empty"><p>This hotel is not available.</p><button className="link-btn" onClick={() => setBookView('hotelResults', {replace: true})}>Show all hotels</button></div>;
  const offers = hotelOffersFor(h), units = hotelUnits(h, s.guests);
  return (<>
    <Photo className="ht-hero" p={h} shade><span className="stars">{starText(h)}</span></Photo>
    <h2 className="ht-name">{h.name}</h2>
    <p className="muted ht-area">{'📍 ' + h.area}</p>
    <p className="ht-about">{h.short}</p>
    <div className="ht-amen">{h.amen.map(a => <span key={a}>{a}</span>)}</div>
    <p className="hint">{searchLine() + ' · ' + plural(units, h.stars ? 'room' : 'bed') + ' '}
      <button className="link-btn" id="htChange" onClick={() => setBookView('hotels')}>Change</button></p>
    <FilterChips id="htOfferFilters" label="Filter offers" options={OFFER_FILTERS} value={s.filters} onChange={k => toggleFilter('ht', k)} />
    {offers.length ? <ProviderList offers={offers} kind="hotel" onPick={(o, cheapest) => openSheet('hotel', {h, o, cheapest})} />
      : <div className="empty"><p>No offer for this hotel matches your filters.</p><button className="link-btn" onClick={() => resetFilters('ht')}>Reset filters</button></div>}
    <p className="demo">Demo prices from fictional providers. Amenities are indicative – check with the hotel.</p>
  </>);
}

function TaxiForm() {
  const t = ui.tx;
  const set = (k, x) => { t[k] = x; emit(); };
  const opts = <>{EXTRA_SPOTS.map(([id, n]) => <option key={id} value={id}>{n}</option>)}
    <optgroup label="Berlin sights">{PLACES.filter(p => !p.cats.includes('food')).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</optgroup>
    <optgroup label="Food & drink">{PLACES.filter(p => p.cats.includes('food')).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</optgroup>
    <optgroup label="Hotels">{HOTELS.map(h => <option key={h.id} value={hotelSpot(h)}>{h.name}</option>)}</optgroup></>;
  const same = t.from === t.to, km = same ? 0 : roadKm(t.from, t.to), mins = Math.round(km * 2.6 + 4);
  const when = w => {
    t.when = w;
    if (w === 'later' && !t.time) { const d = new Date(Date.now() + 36e5); d.setMinutes(0); t.time = new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16); }
    emit();
  };
  const go = () => {
    const s = requestTaxi();
    if (s) openSheet('taxiScheduled', {from: t.from, to: t.to, rideName: s.rideName, when: s.when, bookingRef: s.ref});
  };
  return (<>
    <div className="fgroup"><label>Pick-up</label><select className="field" id="txFrom" value={t.from} onChange={e => set('from', e.target.value)}>{opts}</select></div>
    <div className="fgroup"><label>Destination</label><select className="field" id="txTo" value={t.to} onChange={e => set('to', e.target.value)}>{opts}</select></div>
    <div className="seg"><button className={t.when === 'now' ? 'on' : ''} onClick={() => when('now')}>Now</button><button className={t.when === 'later' ? 'on' : ''} onClick={() => when('later')}>Schedule</button></div>
    {t.when === 'later' && <div className="fgroup"><label>Pick-up time</label><input className="field" type="datetime-local" id="txTime" defaultValue={t.time} onChange={e => t.time = e.target.value} /></div>}
    {same ? <p className="err" style={{display: 'block'}}>Pick-up and destination are the same.</p> : <>
      <p className="hint">{`≈ ${km.toFixed(1).replace('.', ',')} km · about ${mins} min`}</p>
      {RIDES.map(r => (
        <button className={`ride ${t.ride === r.id ? 'on' : ''}`} key={r.id} onClick={() => set('ride', r.id)}><span className="ic">{r.ic}</span>
          <span className="nm"><b>{r.name}</b><small>{r.note}</small></span><span className="pr">{fmtEur(taxiFare(km) * r.f)}</span></button>
      ))}
    </>}
    <button className="btn" id="txGo" disabled={same} onClick={go}>{t.when === 'now' ? 'Request taxi' : 'Schedule taxi'}</button>
    <p className="demo">Prices are estimates based on the Berlin taxi tariff. Demo only – no real taxi is called.</p>
  </>);
}

function Ride() {
  const r = ui.ride;
  if (!r) return null;
  return (<>
    <div className="eta"><small className="muted" id="rideStatus">{r.status}</small><br /><b id="rideEta">{r.eta > 1 || r.pos < 80 ? r.eta + ' min' : 'Arrived'}</b></div>
    <div className="map"><div className="road"></div><span className="pin" style={{left: '8%'}}>📍</span><span className="pin" style={{right: '8%'}}>🏁</span>
      <span className="car" id="rideCar" style={{left: r.pos + '%'}}>🚕</span></div>
    <div className="driver"><span className="av">{r.d[1]}</span><span className="nm"><b>{`${r.d[0]} · ⭐ ${r.d[4]}`}</b><small>{r.d[2]}</small></span><span className="plate">{r.d[3]}</span></div>
    <div className="summary">
      <div><span>From</span><span>{spotName(r.from)}</span></div>
      <div><span>To</span><span>{spotName(r.to)}</span></div>
      <div><span>Ride</span><span>{r.rideName}</span></div>
      <div className="tot"><span>Estimated fare</span><span>{fmtEur(r.price)}</span></div>
    </div>
    <div className="row2"><button className="btn ghost" onClick={() => notInPrototype('Calling the driver')}>📞 Call</button><button className="btn ghost" id="rideCancel" onClick={cancelRide}>Cancel ride</button></div>
  </>);
}
