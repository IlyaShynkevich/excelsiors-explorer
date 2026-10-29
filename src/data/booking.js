// Booking: flights & taxi (demo – no real payment or provider)
import { byId } from './places.js';

// Approximate coordinates, used for taxi distance & price estimates.
export const COORDS = {
  alex:[52.5219,13.4132], hbf:[52.5251,13.3694], ber:[52.3667,13.5033],
  brandenburg:[52.5163,13.3777], reichstag:[52.5186,13.3762], eastside:[52.5050,13.4397], tvtower:[52.5208,13.4094],
  museuminsel:[52.5169,13.4019], dom:[52.5191,13.4011], checkpoint:[52.5075,13.3904], memorial:[52.5139,13.3787],
  wallmemorial:[52.5351,13.3903], tempelhof:[52.4730,13.4039], tiergarten:[52.5145,13.3501], gendarmenmarkt:[52.5137,13.3925],
  charlottenburg:[52.5208,13.2957], mauerpark:[52.5433,13.4022], kadewe:[52.5015,13.3411], potsdamer:[52.5096,13.3760],
  oberbaum:[52.5017,13.4457], zoo:[52.5079,13.3378], hackesche:[52.5246,13.4024],
};
export const EXTRA_SPOTS = [['alex','📍 Current location (Alexanderplatz)'],['hbf','🚉 Berlin Hauptbahnhof'],['ber','✈️ BER Airport']];
export const SPOT_LABEL = {alex:'Alexanderplatz', hbf:'Berlin Hauptbahnhof', ber:'BER Airport'};
export const spotName = id => SPOT_LABEL[id] || (byId(id) || {name:id}).name;
export function roadKm(a, b) {
  const [la1, lo1] = COORDS[a], [la2, lo2] = COORDS[b], R = 6371, r = Math.PI / 180;
  const d = 2 * R * Math.asin(Math.sqrt(Math.sin((la2 - la1) * r / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin((lo2 - lo1) * r / 2) ** 2));
  return Math.max(1, d * 1.3);                       // ~30% detour for real streets
}
// Berlin taxi tariff (approx.): €4.30 base, €2.80/km for the first 7 km, €2.10/km after that.
export const taxiFare = km => 4.3 + Math.min(km, 7) * 2.8 + Math.max(0, km - 7) * 2.1;
export const RIDES = [
  {id:'eco', ic:'🔋', name:'Eco',      note:'Electric car · up to 4',     f:0.95},
  {id:'std', ic:'🚕', name:'Standard', note:'Classic Berlin taxi · up to 4', f:1},
  {id:'xl',  ic:'🚐', name:'XL',       note:'Van · up to 7 · extra luggage', f:1.35},
];
export const CITIES = [['FRA','Frankfurt',1.1,'LH'],['MUC','Munich',1.2,'LH'],['HAM','Hamburg',0.9,'EW'],['CGN','Cologne',1.1,'EW'],
  ['VIE','Vienna',1.3,'OS'],['ZRH','Zurich',1.4,'LX'],['AMS','Amsterdam',1.3,'KL'],['CDG','Paris',1.8,'AF'],['LHR','London',1.9,'BA'],
  ['WAW','Warsaw',1.2,'LO'],['PRG','Prague',1.0,'OK'],['FCO','Rome',2.2,'AZ'],['BCN','Barcelona',2.6,'VY'],['IST','Istanbul',3.2,'TK']];
export const AIRLINES = {LH:'Lufthansa',EW:'Eurowings',OS:'Austrian',LX:'Swiss',KL:'KLM',AF:'Air France',BA:'British Airways',LO:'LOT',OK:'Czech Airlines',AZ:'ITA Airways',VY:'Vueling',TK:'Turkish Airlines',U2:'easyJet',FR:'Ryanair'};export const DRIVERS = [['Mehmet','🧔','Mercedes E-Class','B-EX 2024',4.9],['Anna','👩','Toyota Prius','B-TX 7731',4.8],['Lukas','👨','Tesla Model Y','B-EE 4510',4.9],['Svetlana','👩‍🦰','VW Touran','B-KT 1189',4.7]];

// Seeded random numbers: the same search always shows the same flights.
export function seeded(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }

// Simulated flights for the search f = {city, toBerlin, date, pax, cls}, cheapest first.
export function flightResults(f) {
  const c = CITIES.find(x => x[0] === f.city);
  const rnd = seeded(f.city + f.date + f.toBerlin);
  const carriers = [c[3], c[3], 'U2', 'FR', 'EW', 'LH'];
  const base = 60 + c[2] * 55, flyMin = Math.round(c[2] * 60 + 10);
  const out = [];
  for (let i = 0; i < 6; i++) {
    const code = carriers[i], stop = i >= 4 && c[2] > 1.5 ? 1 : 0;
    const dep = 6 * 60 + Math.round(rnd() * 15 * 60 / 5) * 5;
    const d = flyMin + stop * (70 + Math.round(rnd() * 60));
    const low = code === 'U2' || code === 'FR';
    let price = (base * (low ? 0.7 : 1) + rnd() * 90 - stop * 25) * (f.cls === 'biz' ? (low ? 0 : 3.2) : 1);
    if (!price) continue;                              // low-cost carriers have no business class
    out.push({code, airline:AIRLINES[code], no:code + (100 + (rnd() * 8900 | 0)), dep, arr:dep + d, d, stop, price:Math.round(price) - 0.01});
  }
  return out.sort((a, b) => a.price - b.price);
}
