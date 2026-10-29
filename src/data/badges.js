import { PLACES } from './places.js';

const has = (s, id) => s.visited.includes(id) ? 1 : 0;
const cnt = (s, ids) => ids.filter(i => s.visited.includes(i)).length;
const upTo = (n, t) => Math.min(n, t);
// goal(s) returns [progress, target] for the user data s
export const BADGES = [
  {id:'first',   icon:'👣', name:'First Steps',      c:['#6ee7b7','#059669'], rarity:92, desc:'Check in at your first Berlin destination.',                         goal:s=>[upTo(s.visited.length,1),1]},
  {id:'view',    icon:'🗼', name:'Above the City',   c:['#7dd3fc','#0369a1'], rarity:48, desc:'See Berlin from above: visit the TV Tower and the Reichstag dome.',  goal:s=>[cnt(s,['tvtower','reichstag']),2]},
  {id:'icons',   icon:'🏛️', name:'Icons of Berlin',  c:['#fcd34d','#b45309'], rarity:36, desc:'Visit the Brandenburg Gate, Reichstag, TV Tower and Gendarmenmarkt.', goal:s=>[cnt(s,['brandenburg','reichstag','tvtower','gendarmenmarkt']),4]},
  {id:'wall',    icon:'🧱', name:'Wall Historian',   c:['#d4d4d4','#525252'], rarity:29, desc:'Visit the East Side Gallery, Checkpoint Charlie and the Berlin Wall Memorial.', goal:s=>[cnt(s,['eastside','checkpoint','wallmemorial']),3]},
  {id:'culture', icon:'🎭', name:'Culture Vulture',  c:['#d8b4fe','#7e22ce'], rarity:21, desc:'Visit Museum Island, Berlin Cathedral and Charlottenburg Palace.',  goal:s=>[cnt(s,['museuminsel','dom','charlottenburg']),3]},
  {id:'green',   icon:'🌳', name:'Green Berlin',     c:['#86efac','#166534'], rarity:24, desc:'Relax in Tempelhofer Feld, Tiergarten and Mauerpark.',                goal:s=>[cnt(s,['tempelhof','tiergarten','mauerpark']),3]},
  {id:'runway',  icon:'✈️', name:'Runway Walker',    c:['#bae6fd','#0284c7'], rarity:39, desc:'Walk on the old runways of Tempelhof Airport.',                       goal:s=>[has(s,'tempelhof'),1]},
  {id:'kiez',    icon:'🎨', name:'Kiez Hopper',      c:['#fda4af','#be123c'], rarity:27, desc:'Explore 3 of: East Side Gallery, Oberbaum Bridge, Mauerpark, Hackesche Höfe.', goal:s=>[upTo(cnt(s,['eastside','oberbaum','mauerpark','hackesche']),3),3]},
  {id:'shopper', icon:'🛍️', name:'Shop Till You Drop', c:['#fef08a','#a16207'], rarity:33, desc:'Visit KaDeWe, one of Europe\'s largest department stores.',         goal:s=>[has(s,'kadewe'),1]},
  {id:'zoo',     icon:'🐼', name:'Zoo Friend',       c:['#e5e7eb','#374151'], rarity:31, desc:'Say hi to the pandas at Berlin Zoo.',                                 goal:s=>[has(s,'zoo'),1]},
  {id:'jetset',  icon:'✈️', name:'Jet Setter',       c:['#c4b5fd','#5b21b6'], rarity:26, desc:'Book your first flight in the app.',                                   goal:s=>[upTo(s.bookings.filter(b => b.type === 'flight').length,1),1]},
  {id:'cabbie',  icon:'🚕', name:'Taxi!',            c:['#fef08a','#ca8a04'], rarity:44, desc:'Book your first taxi ride.',                                          goal:s=>[upTo(s.bookings.filter(b => b.type === 'taxi').length,1),1]},
  {id:'social',  icon:'🦋', name:'Social Butterfly', c:['#f9a8d4','#be185d'], rarity:19, desc:'Join your first travel meetup.',                                   goal:s=>[upTo(s.joined.filter(id => !s.myMeetups.some(m => m.id === id)).length,1),1]},
  {id:'host',    icon:'🎤', name:'Host with the Most', c:['#fdba74','#9a3412'], rarity:11, desc:'Create a meetup and invite other travelers.',                     goal:s=>[upTo(s.myMeetups.length,1),1]},
  {id:'collector', icon:'📌', name:'Collector',      c:['#fdba74','#c2410c'], rarity:51, desc:'Save 5 destinations.',                                                goal:s=>[upTo(s.saved.length,5),5]},
  {id:'berliner', icon:'🐻', name:'Echter Berliner', c:['#fca5a5','#991b1b'], rarity:8,  desc:'Check in at 10 destinations. Ick bin een Berliner!',                 goal:s=>[upTo(s.visited.length,10),10]},
  {id:'complete', icon:'🏆', name:'Completionist',   c:['#fde047','#a16207'], rarity:2,  desc:'Check in at every destination in the app.',                          goal:s=>[upTo(s.visited.length,PLACES.length),PLACES.length]},
];
export const byBadge = id => BADGES.find(b => b.id === id);

export const FRIENDS = [
  {name:'Mia K.',   av:'🦊', badges:['first','view','icons','wall','culture','green','runway','kiez','collector','zoo']},
  {name:'Jonas W.', av:'🐻', badges:['first','view','icons','wall','runway','shopper','collector','berliner']},
  {name:'Ana P.',   av:'🐼', badges:['first','culture','kiez','zoo']},
  {name:'Tom R.',   av:'🐸', badges:['first','runway']},
];
