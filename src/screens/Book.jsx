import { ui, emit, toast, openSheet } from '../state/appStore.js';
import { user } from '../state/userData.js';
import { setBookView, flightRoute, requestTaxi, cancelRide } from '../state/booking.js';
import { CITIES, EXTRA_SPOTS, RIDES, flightResults, roadKm, taxiFare, spotName } from '../data/booking.js';
import { PLACES } from '../data/places.js';
import { fmtEur, hm, dur, niceDate, tomorrow, today } from '../lib/format.js';
import { BackButton } from '../components/AppBar.jsx';
import { Stepper } from '../components/Stepper.jsx';

const TITLES = {hub:'Book', flights:'Book a flight', results:'Choose a flight', taxi:'Book a taxi', ride:'Your ride'};
const VIEWS = {hub: Hub, flights: FlightForm, results: FlightResults, taxi: TaxiForm, ride: Ride};
const notInPrototype = what => toast(what + ' (not in prototype)');

// Booking hub with the flight and taxi flows (ui.bookView); the back button steps back inside the flow.
export function Book() {
  const v = ui.bookView, View = VIEWS[v];
  return (
    <section className="screen active" id="book">
      <div className="appbar">
        <BackButton id="bookBack" style={v === 'hub' ? {display: 'none'} : undefined} onClick={() => setBookView(v === 'results' ? 'flights' : 'hub')} />
        Excelsior Explorer
      </div>
      <div className="scroll">
        <h1 className="ltitle" id="bookTitle">{TITLES[v]}</h1>
        <div id="bookBody"><View /></div>
      </div>
    </section>
  );
}

function Hub() {
  const list = [...user.bookings].reverse();
  return (<>
    <div className="bk-hero">
      <button className="bk-tile" style={{background: 'linear-gradient(145deg,#3b82f6,#1e3a8a)'}} onClick={() => setBookView('flights')}><span className="em">✈️</span><span><b>Flights</b><small>To & from Berlin BER</small></span></button>
      <button className="bk-tile" style={{background: 'linear-gradient(145deg,#facc15,#ca8a04)'}} onClick={() => setBookView('taxi')}><span className="em">🚕</span><span><b>Taxi</b><small>Anywhere in Berlin</small></span></button>
    </div>
    <h3 className="sec">My bookings</h3>
    {list.length ? list.map((b, i) => (
      <div className="bk-item" key={i}><span className="ic">{b.type === 'flight' ? '✈️' : '🚕'}</span>
        <span className="nm"><b>{b.title}</b><small>{b.sub}</small></span>
        <span className="amt"><b>{fmtEur(b.price)}</b><br /><span className="st">{b.ref}</span></span></div>
    )) : <p className="hint">No bookings yet. Book a flight to Berlin or grab a taxi to your next sight!</p>}
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

function FlightResults() {
  const f = ui.fl, [A, B] = flightRoute(), res = flightResults(f);
  return (<>
    <p className="hint">{`${A} → ${B} · ${niceDate(f.date)} · ${f.pax} passenger${f.pax > 1 ? 's' : ''} · ${f.cls === 'biz' ? 'Business' : 'Economy'}`}</p>
    {res.map((r, i) => (
      <button className="fl" key={i} data-flight={i} onClick={() => openSheet('flight', {r})}>
        <div className="air"><span><b>{r.airline}</b>{' · ' + r.no}</span>{i === 0 && <span className="fl-badge">CHEAPEST</span>}</div>
        <div className="times">
          <div className="t">{hm(r.dep)}<small>{A}</small></div>
          <div className="line">{dur(r.d)}<br />{r.stop ? '1 stop' : 'Direct'}</div>
          <div className="t" style={{textAlign: 'right'}}>{hm(r.arr)}{r.arr >= 1440 && <sup>+1</sup>}<small>{B}</small></div>
        </div>
        <div className="price">{fmtEur(r.price * f.pax) + ' '}<small>{f.pax > 1 ? `(${fmtEur(r.price)} p.p.)` : 'total'}</small></div>
      </button>
    ))}
  </>);
}

function TaxiForm() {
  const t = ui.tx;
  const set = (k, x) => { t[k] = x; emit(); };
  const opts = <>{EXTRA_SPOTS.map(([id, n]) => <option key={id} value={id}>{n}</option>)}
    <optgroup label="Berlin sights">{PLACES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</optgroup></>;
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
