// ---------- Navigation ----------
// Routes live in the URL hash (#home, #place/brandenburg …) so reload, refresh and the
// browser/phone back button all work. opts.replace = don't add a history entry.
import { useLayoutEffect } from 'react';
import { ui, emit, toast, closeSheet } from '../state/appStore.js';
import { getUser, loggedIn } from '../state/userData.js';
import { lastRoute } from '../state/storage.js';
import { byId } from '../data/places.js';
import { stopRide } from '../state/booking.js';
import { byMeetup, joinedM } from '../state/meetups.js';

export const TABS = ['home','explore','book','saved','profile'];
const SCREENS = ['login','signup','home','explore','book','saved','profile','editProfile','achievements','detail','meetups','meetup','chat'];
const PUBLIC = ['login','signup'];   // the only screens you can see while logged out
const hashFor = name => name === 'detail' ? 'place/' + ui.detailId
  : name === 'editProfile' ? 'profile/edit'
  : name === 'meetups' && ui.mtPlace ? 'meetups/' + ui.mtPlace
  : name === 'meetup' ? 'meetup/' + ui.meetupId
  : name === 'chat' ? 'meetup/' + ui.meetupId + '/chat' : name;

let navIdx = (history.state && history.state.i) || 0;   // how deep we are inside the app
function setHash(h, replace) {
  if (location.hash === '#' + h) return;
  try {
    if (replace) history.replaceState({i: navIdx}, '', '#' + h);
    else history.pushState({i: ++navIdx}, '', '#' + h);
  } catch (e) {}
}
export const canGoBack = () => navIdx > 0;
// Back buttons: browser back while there is app history, otherwise go to the fallback screen.
export const goBack = fallback => canGoBack() ? history.back() : fallback();

export function go(name, opts = {}) {
  if (!SCREENS.includes(name)) { name = 'home'; opts.fromHistory = false; opts.replace = true; }
  if (!PUBLIC.includes(name) && !loggedIn()) { name = 'login'; opts.fromHistory = false; opts.replace = true; }
  if (PUBLIC.includes(name) && loggedIn()) { name = 'home'; opts.fromHistory = false; opts.replace = true; }
  if (name === 'detail' && ui.current !== 'detail') ui.prev = ui.current;
  if (!opts.fromHistory) setHash(hashFor(name), opts.replace || ui.current === name);
  ui.current = name;
  ui.navSeq++;
  lastRoute.set(location.hash);
  if (name === 'login') { const u = getUser(); if (u && !ui.login.email) ui.login.email = u.email; }
  if (name === 'explore' && typeof opts.q === 'string') ui.exploreQ = opts.q;
  if (name === 'book' && !opts.keepView) { stopRide(); ui.bookView = 'hub'; }
  if (name === 'chat') ui.chatFresh = false;
  emit();
}

export function openDetail(id, opts = {}) {
  if (!byId(id)) return go('explore', {replace:true});
  ui.detailId = id;
  go('detail', opts);
}
export function openMeetups(place, opts = {}) {
  ui.mtPlace = byId(place) ? place : '';
  if (ui.mtPlace) ui.mtFilter = 'all';
  go('meetups', opts);
}
export function openMeetup(id, opts = {}) {
  if (!byMeetup(id)) { toast('This meetup no longer exists'); return openMeetups('', {replace:true}); }
  ui.meetupId = id;
  go('meetup', opts);
}
// The chat is only for people who joined; everyone else lands on the meetup page.
export function openChat(id, opts = {}) {
  const m = byMeetup(id);
  if (!m) return openMeetup(id, opts);
  if (!joinedM(m)) { toast('Join the meetup to chat'); return openMeetup(id, {replace:true}); }
  ui.meetupId = id;
  go('chat', opts);
}
export function openBooking(view, dest) {
  stopRide();
  if (view === 'taxi' && dest) ui.tx.to = dest;
  ui.bookView = view;
  go('book', {keepView:true});
}

function route() {
  closeSheet(true);
  const h = decodeURIComponent(location.hash.slice(1));
  if (h === 'profile/edit') go('editProfile', {fromHistory:true});
  else if (h.startsWith('place/')) openDetail(h.slice(6), {fromHistory:true});
  else if (h === 'meetups' || h.startsWith('meetups/')) openMeetups(h.slice(8), {fromHistory:true});
  else if (h.startsWith('meetup/')) { const [id, sub] = h.slice(7).split('/'); (sub === 'chat' ? openChat : openMeetup)(id, {fromHistory:true}); }
  else go(h || (loggedIn() ? 'home' : 'login'), {fromHistory:true});
}

// Shows the screen for the current URL on start and follows the browser back/forward buttons.
export function useHashRouter() {
  useLayoutEffect(() => {
    const onPop = e => { navIdx = (e.state && e.state.i) || 0; route(); };
    window.addEventListener('popstate', onPop);
    route();
    return () => window.removeEventListener('popstate', onPop);
  }, []);
}
