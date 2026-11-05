// App (UI) state that is not saved: current screen, booking forms, the open sheet, the toast …
// Code changes `ui` (or the user data) and then calls emit(); App re-renders through useStore().
import { useSyncExternalStore } from 'react';
import { tomorrow, addDays } from '../lib/format.js';
import { motionMs } from '../lib/motion.js';

export const ui = {
  current: 'login', prev: 'explore', navSeq: 0,   // navSeq changes on every go(): the screen is rendered fresh
  detailId: '', meetupId: '', mtFilter: 'all', mtPlace: '', tripId: '',   // tripId: booking ref or 'm-' + meetup id (#trip/<id>)
  lang: 'English', achTab: 'badges',
  bookView: 'hub', ride: null,
  // flight search; sort + filters of the results (Stage 2: provider comparison)
  fl: {city:'FRA', toBerlin:true, date:tomorrow(), pax:1, cls:'eco', sort:'price', filters:[]},
  // hotel search (city 'BER' = Berlin, else a CITIES code); sel = hotel shown in the detail view
  ht: {city:'BER', checkIn:tomorrow(), checkOut:addDays(tomorrow(), 2), guests:2, sort:'price', filters:[], sel:''},
  tx: {from:'alex', to:'brandenburg', ride:'std', when:'now', time:''},
  typing: {}, chatFresh: false,                   // chat: who is typing per meetup id; animate the newest message
  sheet: {open: false, kind: '', props: null, id: 0},
  toast: {msg: '', show: false},
  // form fields that keep their value while you move around the app
  login: {email: '', pw: '', err: ''},
  signup: {name: '', email: '', pw: '', show: false},
  homeQ: '', exploreQ: '', chatDraft: '',
  // Explore filters (EE-43) + list/map view; `sel` = place previewed on the map
  ex: {cats: [], open: false, diet: [], view: 'list', sel: '', sort: 'default'},   // sort: 'default' | 'near' (Stage 4)
};

let version = 0;
const listeners = new Set();
export function emit() { version++; listeners.forEach(l => l()); }
const subscribe = l => { listeners.add(l); return () => listeners.delete(l); };
export const useStore = () => useSyncExternalStore(subscribe, () => version);

export function toast(msg) {
  ui.toast = {msg, show: true}; emit();
  clearTimeout(toast.t); toast.t = setTimeout(() => { ui.toast = {...ui.toast, show: false}; emit(); }, 1800);
}

// ---------- Bottom sheet + badge unlock queue ----------
// Unlock pop-ups wait in the queue while another sheet (e.g. a booking confirmation) is open.
let sheetQueue = [];
export const sheetOpen = () => ui.sheet.open;
export function openSheet(kind, props = {}) { ui.sheet = {open: true, kind, props, id: ui.sheet.id + 1}; emit(); }
export function closeSheet(silent) {
  const wasOpen = ui.sheet.open;
  ui.sheet = {...ui.sheet, open: false}; emit();
  if (silent === true) { if (wasOpen) sheetQueue = []; return; }
  // the next unlock opens once the closed sheet has fully slid out: BottomSheet calls sheetClosed() then
  if (!wasOpen && sheetQueue.length) setTimeout(nextUnlock, 0);
}
// Called by BottomSheet when a closed sheet has finished sliding out (--dur-sheet-out); a short pause, then the next unlock
export const sheetClosed = () => { if (sheetQueue.length) setTimeout(nextUnlock, Math.min(60, motionMs('sheet-out'))); };
function nextUnlock() { if (!ui.sheet.open && sheetQueue.length) showUnlock(sheetQueue.shift()); }
export function queueUnlocks(list) { sheetQueue = list.slice(1); showUnlock(list[0]); }
export const queuePush = list => sheetQueue.push(...list);
const showUnlock = b => openSheet('unlock', {b});
