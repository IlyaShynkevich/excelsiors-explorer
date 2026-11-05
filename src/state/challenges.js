// ---------- Stage 4 "Arrive": check-ins, daily challenges, streak ----------
// A check-in ("I'm here" at a place or hotel, or "I've arrived" by taxi) is logged with the app's (demo) date.
// It completes today's quests automatically; completed quests are saved per day (they give the points and the streak).
// After a check-in the arrival sheet opens; badge pop-ups wait in the queue until it has closed.
import { emit, openSheet, queuePush } from './appStore.js';
import { setDemoSpot } from './location.js';
import { user, getCheckins, addCheckin, getQuestLog, saveQuestDay, checkUnlocks } from './userData.js';
import { appNow, appToday } from './clock.js';
import { currentHotel } from './trip.js';
import { questsFor, streakAt, pointsOf } from '../data/challenges.js';
import { COORDS } from '../data/booking.js';
import { byId } from '../data/places.js';
import { byHotel } from '../data/hotels.js';

const kindOf = id => id.startsWith('ht-') ? 'hotel' : 'place';
export const canCheckIn = id => !!(byId(id) || (id.startsWith('ht-') && byHotel(id.slice(3))));
export const checkedInToday = id => getCheckins().some(c => c.id === id && c.date === appToday());

// Today's quests with progress: [{id, icon, title, pts, p, t, done}]
export function todaysQuests(date = appToday()) {
  const checks = getCheckins().filter(c => c.date === date).map(c => ({...c, p: byId(c.id) || null, ll: COORDS[c.id]})).filter(c => c.ll);
  const h = currentHotel(), ctx = {hotel: h ? COORDS['ht-' + h.details.hotelId] : COORDS.alex};
  const saved = getQuestLog()[date] || [];
  return questsFor(date).map(q => {
    const [p, t] = q.goal(checks, ctx), done = saved.includes(q.id) || p >= t;
    return {...q, p: done ? t : Math.min(p, t), t, done};
  });
}
export const hasHotel = () => !!currentHotel();
export const streak = () => streakAt(getQuestLog(), appToday());
export const todayPoints = () => pointsOf(getQuestLog()[appToday()] || []);
export const totalPoints = () => Object.values(getQuestLog()).reduce((s, ids) => s + pointsOf(ids), 0);
// The last n days (newest first) with completed quests and points
export const questHistory = n => Object.entries(getQuestLog()).filter(([, ids]) => ids.length).sort((a, b) => b[0].localeCompare(a[0]))
  .slice(0, n).map(([date, ids]) => ({date, n: ids.length, pts: pointsOf(ids)}));

// "I've arrived" (taxi booking in the trip): the demo location becomes the destination, then the same check-in
// and arrival sheet as "I'm here" (Alexanderplatz, Hauptbahnhof or BER: only the sheet, nothing to check in).
export function arrive(spot) { setDemoSpot(spot, true); checkIn(spot); }

// Check in at a place or hotel (spot id). Once per spot and day; opens the arrival sheet either way.
export function checkIn(id) {
  if (!canCheckIn(id)) return openSheet('arrival', {spot: id, quests: []});
  if (checkedInToday(id)) return openSheet('arrival', {spot: id, quests: []});
  const date = appToday(), kind = kindOf(id), first = kind === 'place' && !user.visited.includes(id);
  const before = todaysQuests(date);
  if (first) user.visited.push(id);
  addCheckin({id, date, t: appNow(), first, kind});
  const after = todaysQuests(date), done = after.filter(q => q.done);
  saveQuestDay(date, done.map(q => q.id));
  const fresh = checkUnlocks();   // also saves
  emit();
  openSheet('arrival', {spot: id, quests: done.filter(q => !before.find(b => b.id === q.id).done)});
  if (fresh.length) queuePush(fresh);   // badge pop-ups after the arrival sheet has slid out
}
