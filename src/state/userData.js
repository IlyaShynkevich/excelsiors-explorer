// ---------- User data (EE-7) ----------
// Demo: no backend. All user data is kept in `user` and saved to localStorage under 'ee_berlin';
// the session is the signed-in email under 'ee_session'. Screens only use the named functions below
// (getSession, getUser, saveUser, signIn, signUp, getProfile, saveProfile, deleteUser), never
// localStorage directly, so a real backend can replace this module later.
import { store, lastRoute, DATA_KEY, SESSION_KEY } from './storage.js';
import { AVATARS, DEFAULT_PROFILE } from '../data/avatars.js';
import { BADGES } from '../data/badges.js';

// What a new browser starts with (the demo traveler already has some progress)
export const freshData = () => ({
  saved: ['brandenburg','eastside','reichstag','tempelhof','mauerpark'],
  visited: ['brandenburg','eastside','tvtower','reichstag'],
  unlocked: {first:'2026-09-28', view:'2026-10-12', collector:'2026-10-01'},
  bookings: [], dark: false,
  joined: [], myMeetups: [], chats: {},   // meetups: joined ids, meetups the user created, chat messages per meetup id
  account: null, profile: {...DEFAULT_PROFILE},
});
// The user's data. Always the same object (deleteUser resets it in place), so modules can import it.
export const user = freshData();
let session = '';

const str = (v, max, def) => typeof v === 'string' ? v.trim().slice(0, max) : def;
const cleanProfile = p => (p = p && typeof p === 'object' ? p : {}, {
  name: str(p.name, 30, '') || DEFAULT_PROFILE.name, bio: str(p.bio, 140, DEFAULT_PROFILE.bio), city: str(p.city, 40, ''),
  avatar: AVATARS.some(a => a.id === p.avatar) ? p.avatar : DEFAULT_PROFILE.avatar });
const cleanAccount = a => a && typeof a.email === 'string' && typeof a.pw === 'string' ? {email:a.email, pw:a.pw, created:str(a.created, 10, '')} : null;

// Old saved data has no meetups, account or profile yet: those get defaults.
try {
  const s = JSON.parse(store.get(DATA_KEY) || 'null');
  if (s){ user.saved = s.saved||user.saved; user.dark = !!s.dark;
          user.visited = s.visited||user.visited; user.unlocked = s.unlocked||user.unlocked;
          user.bookings = s.bookings||[];
          user.joined = Array.isArray(s.joined) ? s.joined : []; user.myMeetups = Array.isArray(s.myMeetups) ? s.myMeetups : [];
          user.chats = s.chats && typeof s.chats === 'object' ? s.chats : {};
          user.account = cleanAccount(s.account); user.profile = cleanProfile(s.profile); }
} catch(e){}

export const persist = () => store.set(DATA_KEY, JSON.stringify({saved:user.saved, dark:user.dark, visited:user.visited, unlocked:user.unlocked, bookings:user.bookings,
                                                                 joined:user.joined, myMeetups:user.myMeetups, chats:user.chats, account:user.account, profile:user.profile}));
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
  saveProfile({name, bio: user.profile.bio === DEFAULT_PROFILE.bio ? '' : user.profile.bio});   // don't inherit the demo bio
  setSession(email);
  return '';
}
export const getProfile = () => ({...user.profile});
export function saveProfile(changes) { user.profile = cleanProfile({...user.profile, ...changes}); persist(); syncMe(); return getProfile(); }
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
