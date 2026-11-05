// ---------- Trip reminders (simulated, in-app only; no browser notifications) ----------
// Generated from the trip: flight 2 hours before, taxi 15 minutes before, meetup 1 hour before, hotel check-in
// the day before. A reminder shows once its time has come (real clock). "Demo: show reminders now" (Profile)
// treats every upcoming reminder as due. Settings and read ids are saved through userData.js.
import { emit, toast } from './appStore.js';
import { getReminderSettings, setRemindersOn, setRemindersDemo, markRemindersRead } from './userData.js';
import { tripItems, timeOf, dayLabel } from './trip.js';

const LEAD = {flight: 2 * 36e5, taxi: 15 * 6e4, meetup: 36e5, hotel: 864e5};
const WHEN = {flight: '2 hours before departure', taxi: '15 minutes before pick-up', meetup: '1 hour before the meetup', hotel: 'The day before check-in'};
const KEEP = 12 * 36e5;   // reminders of things that started more than 12 hours ago are no longer shown

const text = it => ({
  flight: `Your flight ${it.title} leaves at ${timeOf(it.t)}. Be at the airport in time.`,
  taxi: `Your taxi ${it.title} picks you up at ${timeOf(it.t)}.`,
  meetup: `“${it.title}” starts at ${timeOf(it.t)}${it.sub ? ' at ' + it.sub : ''}.`,
  hotel: `Check-in at ${it.title} tomorrow from ${timeOf(it.t)}.`,
})[it.kind];

// All reminders of the trip (cancelled bookings and check-outs have none): {id, itemId, kind, due, t, title, text, when}
// The id includes the start time, so a changed booking gets a fresh reminder.
export function allReminders() {
  return tripItems().filter(it => !it.cancelled && it.t !== null && LEAD[it.kind] && !it.key.endsWith(':out')).map(it => ({
    id: `${it.kind}:${it.id}:${it.t}`, itemId: it.id, kind: it.kind, due: it.t - LEAD[it.kind], t: it.t,
    title: it.kind === 'hotel' ? 'Check-in tomorrow' : it.title, text: text(it), when: WHEN[it.kind] + ' · ' + dayLabel(it.t)}));
}
// The reminders that are due now (newest first), each with read: true/false. None while reminders are off.
export function dueReminders() {
  const s = getReminderSettings(), now = Date.now();
  if (!s.on) return [];
  return allReminders().filter(r => r.t > now - KEEP && (r.due <= now || (s.demo && r.t > now)))
    .map(r => ({...r, read: s.read.includes(r.id)})).sort((a, b) => b.due - a.due);
}
export const unreadCount = () => dueReminders().filter(r => !r.read).length;
export const remindersOn = () => getReminderSettings().on;
export const remindersDemo = () => getReminderSettings().demo;

export function markRead(ids) { markRemindersRead(ids); emit(); }
export const markAllRead = () => markRead(dueReminders().map(r => r.id));
export function toggleReminders() {
  const on = !remindersOn();
  setRemindersOn(on); emit();
  toast(on ? 'Reminders on' : 'Reminders off');
}
export function toggleRemindersDemo() {
  const on = !remindersDemo();
  setRemindersDemo(on); emit();
  toast(on ? 'Demo: all upcoming reminders are due now' : 'Demo off: reminders at their real time');
}
