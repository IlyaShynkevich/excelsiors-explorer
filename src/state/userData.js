// ---------- User data (EE-7) ----------
// Demo: no backend. All user data is kept in `user` and saved to localStorage under 'ee_berlin';
// the session is the signed-in email under 'ee_session'. Screens only use the named functions below
// (getSession, getUser, saveUser, signIn, signUp, getProfile, saveProfile, deleteUser), never
// localStorage directly, so a real backend can replace this module later.
import { store, lastRoute, DATA_KEY, SESSION_KEY } from './storage.js';
import { AVATARS, DEFAULT_PROFILE } from '../data/avatars.js';
import { BADGES } from '../data/badges.js';
import { INTERESTS } from '../data/places.js';

// What a new browser starts with (the demo traveler already has some progress)
export const freshData = () => ({
  saved: ['brandenburg','eastside','reichstag','tempelhof','mauerpark'],
  visited: ['brandenburg','eastside','tvtower','reichstag'],
  unlocked: {first:'2026-09-28', view:'2026-10-12', collector:'2026-10-01'},
  bookings: [], dark: false,
  joined: [], myMeetups: [], chats: {},   // meetups: joined ids, meetups the user created, chat messages per meetup id
  account: null, profile: {...DEFAULT_PROFILE, interests: []},
  reminders: {on: true, demo: false, read: []},   // trip reminders: switch, demo "all due now", ids marked as read
});
// The user's data. Always the same object (deleteUser resets it in place), so modules can import it.
export const user = freshData();
let session = '';

const str = (v, max, def) => typeof v === 'string' ? v.trim().slice(0, max) : def;
const cleanProfile = p => (p = p && typeof p === 'object' ? p : {}, {
  name: str(p.name, 30, '') || DEFAULT_PROFILE.name, bio: str(p.bio, 140, DEFAULT_PROFILE.bio), city: str(p.city, 40, ''),
  avatar: AVATARS.some(a => a.id === p.avatar) ? p.avatar : DEFAULT_PROFILE.avatar,
  // older saved profiles have no interests yet: none picked, and the onboarding screen still to come
  interests: Array.isArray(p.interests) ? INTERESTS.map(i => i[0]).filter(id => p.interests.includes(id)) : [],
  onboarded: !!p.onboarded });
// Bookings (flight, hotel, taxi) all have the same shape. Older saved bookings only had
// {type, ref, price, title, sub}: the new fields get defaults.
const BOOKING_TYPES = ['flight', 'hotel', 'taxi'];
const cleanBooking = b => b && typeof b === 'object' && BOOKING_TYPES.includes(b.type) ? {
  type: b.type, ref: str(b.ref, 12, '') || '------',
  status: b.status === 'Cancelled' || / · cancelled$/.test(b.sub || '') ? 'Cancelled' : 'Confirmed',
  provider: str(b.provider, 40, ''), price: typeof b.price === 'number' && isFinite(b.price) ? b.price : 0, cheapest: !!b.cheapest,
  title: str(b.title, 120, ''), sub: str(b.sub, 160, ''),
  start: str(b.start, 16, ''), end: str(b.end, 16, ''),   // local 'YYYY-MM-DDTHH:MM' (for the trip overview)
  created: str(b.created, 24, ''), details: b.details && typeof b.details === 'object' ? b.details : {},
} : null;
// Older saved data has no reminder settings yet: on, real times, nothing read
const cleanReminders = r => (r = r && typeof r === 'object' ? r : {}, {
  on: r.on !== false, demo: !!r.demo, read: Array.isArray(r.read) ? r.read.filter(x => typeof x === 'string').slice(-200) : []});
const cleanAccount = a => a && typeof a.email === 'string' && typeof a.pw === 'string' ? {email:a.email, pw:a.pw, created:str(a.created, 10, '')} : null;

// Old saved data has no meetups, account or profile yet: those get defaults.
try {
  const s = JSON.parse(store.get(DATA_KEY) || 'null');
  if (s){ user.saved = s.saved||user.saved; user.dark = !!s.dark;
          user.visited = s.visited||user.visited; user.unlocked = s.unlocked||user.unlocked;
          user.bookings = Array.isArray(s.bookings) ? s.bookings.map(cleanBooking).filter(Boolean) : [];
          user.joined = Array.isArray(s.joined) ? s.joined : []; user.myMeetups = Array.isArray(s.myMeetups) ? s.myMeetups : [];
          user.chats = s.chats && typeof s.chats === 'object' ? s.chats : {};
          user.account = cleanAccount(s.account); user.profile = cleanProfile(s.profile); user.reminders = cleanReminders(s.reminders); }
} catch(e){}

export const persist = () => store.set(DATA_KEY, JSON.stringify({saved:user.saved, dark:user.dark, visited:user.visited, unlocked:user.unlocked, bookings:user.bookings,
                                                                 joined:user.joined, myMeetups:user.myMeetups, chats:user.chats, account:user.account, profile:user.profile,
                                                                 reminders:user.reminders}));
// Demo only, NOT secure: a real backend would hash passwords on the server.
const pwHash = pw => { let h = 2166136261; for (const c of 'ee7:' + pw) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0).toString(36); };

export const getSession = () => store.get(SESSION_KEY) || session || '';
export function setSession(email) { session = email; store.set(SESSION_KEY, email); }
export function clearSession() { session = ''; store.del(SESSION_KEY); }
export const loggedIn = () => !!getSession();
export const getUser = () => user.account && {email: user.account.email, created: user.account.created};
export function saveUser({email, pw}) {
  user.account = {email, pw: pwHash(pw), created: (user.account && user.account.created) || new Date().toISOString().slice(0, 10)};
  persist();
}
// One account per browser. Its email needs the right password; any other email uses the old demo login (any password).
export function signIn(email, pw) {
  const a = user.account;
  if (a && a.email === email && a.pw !== pwHash(pw)) return 'Wrong password. Please try again.';
  setSession(email);
  return '';
}
export function signUp({name, email, pw}) {
  const a = user.account;
  if (a) return a.email === email ? 'You already have an account with this email. Sign in instead.'
                                  : 'This browser already has an account (demo: one per browser). Sign in with it, or delete it in the profile first.';
  saveUser({email, pw});
  // don't inherit the demo bio; a new account picks its own interests (onboarding after the first sign-up)
  saveProfile({name, bio: user.profile.bio === DEFAULT_PROFILE.bio ? '' : user.profile.bio, interests: [], onboarded: false});
  setSession(email);
  return '';
}
export const getProfile = () => ({...user.profile, interests: [...user.profile.interests]});
// Onboarding interests: shown after the first sign-up, and once on the first demo login
export const needsOnboarding = () => !user.profile.onboarded;
export const markOnboarded = () => saveProfile({onboarded: true});
export const saveInterests = interests => saveProfile({interests});
export function saveProfile(changes) { user.profile = cleanProfile({...user.profile, ...changes}); persist(); syncMe(); return getProfile(); }
// ---------- Bookings ----------
// createBooking({type, ref, provider, price, cheapest, title, sub, start, end, details}) saves a confirmed booking and returns it.
export function createBooking(b) {
  const nb = cleanBooking({...b, status: 'Confirmed', created: new Date().toISOString()});
  user.bookings.push(nb); persist();
  return {...nb};
}
export const getBookings = () => user.bookings.map(b => ({...b})).reverse();   // newest first
export const getBooking = ref => { const b = user.bookings.find(x => x.ref === ref); return b ? {...b} : null; };
// Cancelled bookings stay in the list (price 0, "· cancelled" added to the line below the title).
// info = {refund, fee} from the provider's terms (Trip → Cancel booking); details keep what was paid.
export function cancelBooking(ref, info = {}) {
  const b = user.bookings.find(x => x.ref === ref);
  if (!b || b.status === 'Cancelled') return;
  const fee = typeof info.fee === 'number' ? info.fee : 0, refund = typeof info.refund === 'number' ? info.refund : b.price - fee;
  b.details = {...b.details, paid: b.price, refund, cancelFee: fee, cancelledAt: new Date().toISOString()};
  Object.assign(b, {status: 'Cancelled', price: 0, sub: b.sub + ' · cancelled'}); persist();
}
// Change a confirmed booking (Trip → Change booking): new date/time, price, lines and details. Returns the booking.
const CHANGEABLE = ['provider', 'price', 'title', 'sub', 'start', 'end', 'details'];
export function updateBooking(ref, changes) {
  const b = user.bookings.find(x => x.ref === ref);
  if (!b || b.status === 'Cancelled') return null;
  const next = cleanBooking({...b, ...Object.fromEntries(CHANGEABLE.filter(k => k in changes).map(k => [k, changes[k]]))});
  if (!next) return null;
  Object.assign(b, next); persist();
  return {...b};
}
// ---------- Trip reminders (simulated, in-app only) ----------
export const getReminderSettings = () => ({...user.reminders, read: [...user.reminders.read]});
export function setRemindersOn(on) { user.reminders.on = !!on; persist(); }
export function setRemindersDemo(on) { user.reminders.demo = !!on; persist(); }
export function markRemindersRead(ids) {
  const r = user.reminders;
  r.read = [...r.read, ...ids.filter(id => !r.read.includes(id))].slice(-200); persist();
}

// Removes everything this user stored in the browser and logs out.
export function deleteUser() {
  store.del(DATA_KEY); clearSession();
  lastRoute.clear();
  Object.assign(user, freshData());
  syncMe();
}

// The signed-in user as shown in meetups, chats and the leaderboard (same object, updated on save)
export const ME = {me:true};
function syncMe() { ME.name = user.profile.name; ME.avatar = user.profile.avatar; }
syncMe();

// ---------- Badges ----------
export const isEarned = id => !!user.unlocked[id];
export const myBadges = () => BADGES.filter(b => isEarned(b.id)).map(b => b.id);
// Badges are permanent once unlocked. Returns newly unlocked badges.
export function checkUnlocks() {
  const fresh = [];
  BADGES.forEach(b => {
    const [p, t] = b.goal(user);
    if (!user.unlocked[b.id] && p >= t) { user.unlocked[b.id] = new Date().toISOString().slice(0,10); fresh.push(b); }
  });
  persist();
  return fresh;
}
checkUnlocks();
