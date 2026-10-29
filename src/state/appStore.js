// App (UI) state that is not saved: current screen, booking forms, the open sheet, the toast …
// Code changes `ui` (or the user data) and then calls emit(); App re-renders through useStore().
import { useSyncExternalStore } from 'react';
import { tomorrow } from '../lib/format.js';

export const ui = {
  current: 'login', prev: 'explore', navSeq: 0,   // navSeq changes on every go(): the screen is rendered fresh
  detailId: '', meetupId: '', mtFilter: 'all', mtPlace: '',
  lang: 'English', achTab: 'badges',
  bookView: 'hub', ride: null,
  fl: {city:'FRA', toBerlin:true, date:tomorrow(), pax:1, cls:'eco'},
  tx: {from:'alex', to:'brandenburg', ride:'std', when:'now', time:''},
  typing: {}, chatFresh: false,                   // chat: who is typing per meetup id; animate the newest message
  sheet: {open: false, kind: '', props: null, id: 0},
  toast: {msg: '', show: false},
  // form fields that keep their value while you move around the app
  login: {email: '', pw: '', err: ''},
  signup: {name: '', email: '', pw: '', show: false},
  homeQ: '', exploreQ: '', chatDraft: '',
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
  if (sheetQueue.length) setTimeout(() => showUnlock(sheetQueue.shift()), 250);
}
export function queueUnlocks(list) { sheetQueue = list.slice(1); showUnlock(list[0]); }
export const queuePush = list => sheetQueue.push(...list);
const showUnlock = b => openSheet('unlock', {b});
