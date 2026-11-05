// Hotels (Stage 2 "Book"): 10 Berlin hotels and hostels. Prices and providers are demo data.
// Real, well-known hotels use free-licensed photos from Wikimedia Commons; the two fictional ones
// (fictional: true) have no photo and show their colour gradient instead.
import { seeded, shuffle, COORDS, SPOT_LABEL } from './booking.js';

const grad = (a, b, c) => `linear-gradient(160deg,${a},${b}${c ? ',' + c : ''})`;
const C = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/';
// ll: approximate [lat, lon] (taxi and directions). stars: 1–5, 0 = hostel. base: demo rate per room (hostel: per bed) and night in €.
export const HOTELS = [
  {id:'adlon', ll:[52.5161,13.3801], name:'Hotel Adlon Kempinski', area:'Mitte · Pariser Platz', stars:5, base:340, g:grad('#d6c7a1','#8a7444','#2d2a26'),
   img:C + '0/0a/Hotel_Adlon_%28Berlin%29.jpg/960px-Hotel_Adlon_%28Berlin%29.jpg',
   short:'Grand hotel right next to the Brandenburg Gate, rebuilt in 1997 on the site of the famous original from 1907.',
   amen:['📶 Free Wi-Fi','🍽️ Restaurant','💆 Spa','🏊 Pool','🏋️ Gym','🔑 24h reception']},
  {id:'derome', ll:[52.5164,13.3934], name:'Hotel de Rome', area:'Mitte · Bebelplatz', stars:5, base:310, g:grad('#cbd5e1','#64748b','#1e293b'),
   img:C + '4/47/Hotel_de_Rome%2C_Berlin_%28P1080140%29.jpg/960px-Hotel_de_Rome%2C_Berlin_%28P1080140%29.jpg',
   short:'Luxury hotel in a 19th-century former bank building on Bebelplatz, with a rooftop terrace near the State Opera.',
   amen:['📶 Free Wi-Fi','🌇 Rooftop terrace','💆 Spa','🏊 Pool','🍸 Bar']},
  {id:'zoo', ll:[52.5036,13.3296], name:'Hotel Zoo Berlin', area:'Charlottenburg · Kurfürstendamm', stars:5, base:210, g:grad('#fcd34d','#a16207','#292524'),
   img:C + '1/1a/Berlin-Kurfuerstendamm-118-Nr_26-Hotel_Zoo-2016-gje.jpg/960px-Berlin-Kurfuerstendamm-118-Nr_26-Hotel_Zoo-2016-gje.jpg',
   short:'Boutique hotel on Kurfürstendamm, a short walk from Zoo station and the Kaiser Wilhelm Memorial Church.',
   amen:['📶 Free Wi-Fi','🍸 Bar','🍽️ Restaurant','🏋️ Gym','🐾 Pets allowed']},
  {id:'parkinn', ll:[52.5226,13.4130], name:'Park Inn by Radisson Berlin Alexanderplatz', area:'Mitte · Alexanderplatz', stars:4, base:115, g:grad('#93c5fd','#1d4ed8','#0f172a'),
   img:C + 'e/e5/Park_Inn_by_Radisson_Alexanderplatz_-_Berlin.jpg/960px-Park_Inn_by_Radisson_Alexanderplatz_-_Berlin.jpg',
   short:'One of Berlin\'s tallest buildings, right on Alexanderplatz next to the TV Tower, with a roof terrace high above the city.',
   amen:['📶 Free Wi-Fi','🌇 Roof terrace','🏋️ Gym','💆 Spa','🍽️ Restaurant']},
  {id:'bikini', ll:[52.5054,13.3369], name:'25hours Hotel Bikini Berlin', area:'Charlottenburg · Zoo', stars:4, base:150, g:grad('#86efac','#15803d','#14532d'),
   img:C + '2/2c/Bikini_Berlin_Stra%C3%9Fenansicht_2014.jpg/960px-Bikini_Berlin_Stra%C3%9Fenansicht_2014.jpg',
   short:'Design hotel in the Bikini Berlin building with views over the Zoo, a rooftop bar and bikes to borrow.',
   amen:['📶 Free Wi-Fi','🍸 Rooftop bar','🚲 Bikes to borrow','🍽️ Restaurant','🧖 Sauna']},
  {id:'nhow', ll:[52.5010,13.4500], name:'nhow Berlin', area:'Friedrichshain · Osthafen', stars:4, base:130, g:grad('#f9a8d4','#be185d','#3b0764'),
   img:C + '8/8e/Hotel_nhow_am_Osthafen_%28Spree%29_in_Berlin_%282014%29.jpg/960px-Hotel_nhow_am_Osthafen_%28Spree%29_in_Berlin_%282014%29.jpg',
   short:'Music-themed hotel on the Spree in Friedrichshain, close to the East Side Gallery, with its own recording studios.',
   amen:['📶 Free Wi-Fi','🎸 Music studios','🏋️ Gym','🍸 Bar','🅿️ Parking']},
  {id:'spreeblick', ll:[52.5009,13.4413], name:'Spreeblick Hotel', area:'Kreuzberg · Schlesisches Tor', stars:3, base:89, g:grad('#67e8f9','#0e7490','#164e63'), fictional:true,
   short:'Small, friendly hotel near the Oberbaum Bridge with bright rooms and a garden courtyard (fictional demo hotel).',
   amen:['📶 Free Wi-Fi','🌿 Courtyard','🚲 Bike rental','🐾 Pets allowed']},
  {id:'kastanie', ll:[52.5363,13.4175], name:'Pension Kastanie', area:'Prenzlauer Berg · Kollwitzkiez', stars:2, base:62, g:grad('#fdba74','#c2410c','#431407'), fictional:true,
   short:'Family-run guesthouse in a quiet old building, close to Mauerpark and the cafés of Kollwitzplatz (fictional demo hotel).',
   amen:['📶 Free Wi-Fi','☕ Coffee corner','🧺 Laundry']},
  {id:'circus', ll:[52.5298,13.4016], name:'Circus Hostel', area:'Mitte · Rosenthaler Platz', stars:0, base:42, g:grad('#fca5a5','#b91c1c','#450a0a'),
   img:'https://upload.wikimedia.org/wikipedia/commons/2/2b/02006_004_Circus_Hostel.jpg',
   short:'Popular hostel at Rosenthaler Platz with dorms and private rooms, a café and a bar, right by the U-Bahn.',
   amen:['📶 Free Wi-Fi','🍸 Bar','☕ Café','🔑 24h reception','🧺 Laundry']},
  {id:'generator', ll:[52.5249,13.3921], name:'Generator Berlin Mitte', area:'Mitte · Oranienburger Straße', stars:0, base:36, g:grad('#c4b5fd','#6d28d9','#2e1065'),
   img:C + 'e/e4/20230628_xl_0845-Generator_Berlin_Mitte.jpg/960px-20230628_xl_0845-Generator_Berlin_Mitte.jpg',
   short:'Large design hostel in Mitte with dorms and private rooms, a bar and a lounge, close to Museum Island.',
   amen:['📶 Free Wi-Fi','🍸 Bar','🛋️ Lounge','🔑 24h reception']},
];
export const byHotel = id => HOTELS.find(h => h.id === id);
// Hotels are taxi spots too ('ht-<id>', e.g. a taxi from your hotel), with the hotel name as label
export const hotelSpot = h => 'ht-' + h.id;
HOTELS.forEach(h => { COORDS[hotelSpot(h)] = h.ll; SPOT_LABEL[hotelSpot(h)] = h.name; });
export const starText = h => h.stars ? '★'.repeat(h.stars) : 'Hostel';

// Fictional booking sites (demo, made-up names) that offer the same room at different prices and terms.
export const HOTEL_PROVIDERS = [
  {id:'bettboerse', name:'BettBörse', ic:'🛏️'}, {id:'kiezstays', name:'Kiez Stays', ic:'🏘️'},
  {id:'nachtquartier', name:'Nachtquartier', ic:'🌙'}, {id:'schlafgut', name:'Schlafgut Deals', ic:'😴'},
  {id:'koffer', name:'Koffer & Co', ic:'🧳'},
];
export const CITY_TAX = 0.075;   // Berlin City Tax (7.5 % of the room price)
const r2 = n => Math.round(n * 100) / 100;

// Rooms (2 guests each) or hostel beds (1 per guest) for s = {guests}
export const hotelUnits = (h, guests) => h.stars ? Math.ceil(guests / 2) : guests;
export const nightsOf = (a, b) => Math.max(1, Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5));

// 3–5 provider offers for hotel h and the search s = {checkIn, checkOut, guests}, cheapest first.
// Seeded: the same hotel and dates always show the same offers.
export function hotelOffers(h, s) {
  const rnd = seeded(h.id + s.checkIn + s.checkOut), nights = nightsOf(s.checkIn, s.checkOut), units = hotelUnits(h, s.guests);
  const n = 3 + (rnd() * 3 | 0);
  return shuffle(HOTEL_PROVIDERS, rnd).slice(0, n).map(p => {
    const breakfast = rnd() < .45, free = rnd() < .5;
    let rate = h.base * (0.88 + rnd() * 0.24);
    if (breakfast) rate += h.stars ? 10 + h.stars * 4 : 7;
    if (free) rate *= 1.06;
    rate = Math.round(rate);
    const fee = rnd() < .4 ? 0 : Math.round(3 + rnd() * 9), room = rate * units * nights;
    const taxes = r2(room * CITY_TAX + fee);
    return {id:p.id, name:p.name, ic:p.ic, rate, breakfast, free, fee, nights, units, room, taxes, total:r2(room + taxes)};
  }).sort((a, b) => a.total - b.total);
}
