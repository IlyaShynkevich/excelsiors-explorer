// Stage 4 "Arrive": daily challenges (quests). Every day gets 3 quests from this pool, chosen with a seeded
// shuffle of the date, so everybody sees the same quests on the same (demo) day. Check-ins complete them.
// goal(checks, ctx) → [progress, target]. checks = today's check-ins: {id, kind 'place'|'hotel', first, p (place|null), ll}.
// ctx = {hotel: [lat, lon] of the user's hotel (or Alexanderplatz)}.
import { seeded, shuffle, kmBetween } from './booking.js';

const places = cs => cs.filter(c => c.p);
const any = test => cs => [places(cs).some(c => test(c.p)) ? 1 : 0, 1];
const distinct = cs => new Set(cs.map(c => c.id)).size;

export const QUESTS = [
  {id: 'history',   icon: '🏛️', title: 'Visit a historic landmark',            pts: 20, goal: any(p => p.tags.includes('history'))},
  {id: 'food',      icon: '🍴', title: 'Try a food place',                     pts: 20, goal: any(p => p.cats.includes('food'))},
  {id: 'two',       icon: '✌️', title: 'Check in at 2 places today',           pts: 30, goal: cs => [distinct(cs), 2]},
  {id: 'three',     icon: '🏃', title: 'Check in at 3 places today',           pts: 40, goal: cs => [distinct(cs), 3]},
  {id: 'nearhotel', icon: '🏨', title: 'Visit a place within 500 m of your hotel', pts: 30,
   goal: (cs, ctx) => [places(cs).some(c => kmBetween(c.ll, ctx.hotel) <= .5) ? 1 : 0, 1]},
  {id: 'museum',    icon: '🖼️', title: 'Check in at a museum',                 pts: 20, goal: any(p => p.cats.includes('museums'))},
  {id: 'park',      icon: '🌳', title: 'Check in at a park',                   pts: 20, goal: any(p => p.cats.includes('parks'))},
  {id: 'streetart', icon: '🎨', title: 'Find some street art',                 pts: 20, goal: any(p => p.tags.includes('streetart'))},
  {id: 'nightlife', icon: '🌙', title: 'Check out a nightlife spot',           pts: 20, goal: any(p => p.cats.includes('nightlife'))},
  {id: 'architecture', icon: '🏗️', title: 'Admire great architecture',         pts: 20, goal: any(p => p.tags.includes('architecture'))},
  {id: 'shopping',  icon: '🛍️', title: 'Go shopping',                          pts: 20, goal: any(p => p.tags.includes('shopping'))},
  {id: 'new',       icon: '✨', title: 'Discover a place you haven\'t visited yet', pts: 30, goal: cs => [places(cs).some(c => c.first) ? 1 : 0, 1]},
  {id: 'hotel',     icon: '🛎️', title: 'Check in at a hotel',                  pts: 20, goal: cs => [cs.some(c => c.kind === 'hotel') ? 1 : 0, 1]},
];
export const byQuest = id => QUESTS.find(q => q.id === id);

// The 3 quests of a day ('YYYY-MM-DD'); never both "2 places" and "3 places"
export function questsFor(date) {
  const list = shuffle(QUESTS, seeded('quests:' + date)), out = [];
  for (const q of list) {
    if (out.length === 3) break;
    if ((q.id === 'two' && out.some(x => x.id === 'three')) || (q.id === 'three' && out.some(x => x.id === 'two'))) continue;
    out.push(q);
  }
  return out;
}

// ---- helpers on the saved data (also used by the badge goals) ----
// log = {date: [completed quest ids]}; a day counts for the streak when it has at least one completed quest
const dayMs = 864e5, dayNo = d => Math.round(new Date(d + 'T12:00Z').getTime() / dayMs);
export function streakAt(log, today) {
  const days = new Set(Object.keys(log).filter(d => log[d].length).map(dayNo));
  let n = dayNo(today);
  if (!days.has(n)) n--;                    // today not done yet: the streak of yesterday still counts
  let s = 0;
  while (days.has(n)) { s++; n--; }
  return s;
}
export function bestStreak(log) {
  const days = Object.keys(log).filter(d => log[d].length).map(dayNo).sort((a, b) => a - b);
  let best = 0, run = 0;
  days.forEach((d, i) => { run = i && d === days[i - 1] + 1 ? run + 1 : 1; best = Math.max(best, run); });
  return best;
}
export const pointsOf = ids => ids.reduce((s, id) => s + ((byQuest(id) || {}).pts || 0), 0);
export const mostQuestsInADay = log => Math.max(0, ...Object.values(log).map(a => a.length));
// Hotel Hopper: the most different hotels checked in at on one day
export function mostHotelsInADay(checkins) {
  const by = {};
  checkins.filter(c => c.kind === 'hotel').forEach(c => { (by[c.date] = by[c.date] || new Set()).add(c.id); });
  return Math.max(0, ...Object.values(by).map(s => s.size));
}
