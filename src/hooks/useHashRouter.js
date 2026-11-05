// ---------- Navigation ----------
// Routes live in the URL hash (#home, #place/brandenburg …) so reload, refresh and the
// browser/phone back button all work. opts.replace = don't add a history entry.
import { useLayoutEffect } from 'react';
import { ui, emit, toast, closeSheet } from '../state/appStore.js';
import { getUser, loggedIn, needsOnboarding, markOnboarded } from '../state/userData.js';
import { lastRoute } from '../state/storage.js';
import { byId } from '../data/places.js';
import { byHotel } from '../data/hotels.js';
import { stopRide } from '../state/booking.js';
import { byMeetup, joinedM } from '../state/meetups.js';
import { tripEntry } from '../state/trip.js';
import { navStart } from '../lib/motion.js';

export const TABS = ['home','explore','book','saved','profile'];
const SCREENS = ['login','signup','home','explore','book','saved','profile','editProfile','achievements','detail','meetups','meetup','chat','interests',
                 'trip','tripItem','reminders'];
const PUBLIC = ['login','signup'];   // the only screens you can see while logged out
// Book steps (ui.bookView) ↔ #book/<path>. The live ride can't be restored, so #book/ride opens the hub.
const BOOK_PATHS = {flights:'flights', results:'flights/results', taxi:'taxi', ride:'ride', hotels:'hotels', hotelResults:'hotels/results'};
const bookPath = () => ui.bookView === 'hotel' ? 'hotel/' + ui.ht.sel : BOOK_PATHS[ui.bookView];
const hashFor = name => name === 'detail' ? 'place/' + ui.detailId
  : name === 'book' && ui.bookView !== 'hub' ? 'book/' + bookPath()
  : name === 'editProfile' ? 'profile/edit'
  : name === 'meetups' && ui.mtPlace ? 'meetups/' + ui.mtPlace
  : name === 'meetup' ? 'meetup/' + ui.meetupId
  : name === 'chat' ? 'meetup/' + ui.meetupId + '/chat'
  : name === 'tripItem' ? 'trip/' + ui.tripId : name;

let navIdx = (history.state && history.state.i) || 0;   // how deep we are inside the app
function setHash(h, replace) {
  if (location.hash === '#' + h) return;
  try {
    if (replace) history.replaceState({i: navIdx}, '', '#' + h);
    else history.pushState({i: ++navIdx}, '', '#' + h);
  } catch (e) {}
}
export const canGoBack = () => navIdx > 0;
// Back buttons: browser back while there is app history, otherwise go to the fallback screen
// (that still looks like going back).
let hint = '', popDir = '';
export const goBack = fallback => { if (canGoBack()) return history.back(); hint = 'back'; fallback(); };

// Which screen transition to show (see lib/motion.js)
function navDir(from, to, opts) {
  const h = hint, p = popDir; hint = popDir = '';
  if (from === to) return 'none';
  if (TABS.includes(from) && TABS.includes(to)) return 'tab';
  if (opts.fromHistory) return p || 'fade';
  return h || (opts.replace ? 'fade' : 'forward');
}

export function go(name, opts = {}) {
  if (!SCREENS.includes(name)) { name = 'home'; opts.fromHistory = false; opts.replace = true; }
  if (!PUBLIC.includes(name) && !loggedIn()) { name = 'login'; opts.fromHistory = false; opts.replace = true; }
  if (PUBLIC.includes(name) && loggedIn()) { name = 'home'; opts.fromHistory = false; opts.replace = true; }
  if (name === 'detail' && ui.current !== 'detail') ui.prev = ui.current;
  navStart(navDir(ui.current, name, opts));
  if (name === 'book' && !opts.keepView) { stopRide(); ui.bookView = 'hub'; }
  // the same screen again replaces the history entry, unless it is a new step (opts.push, e.g. inside Book)
  if (!opts.fromHistory) setHash(hashFor(name), opts.replace || (ui.current === name && !opts.push));
  ui.current = name;
  ui.navSeq++;
  lastRoute.set(location.hash);
  if (name === 'login') { const u = getUser(); if (u && !ui.login.email) ui.login.email = u.email; }
  if (name === 'explore' && typeof opts.q === 'string') ui.exploreQ = opts.q;
  if (name === 'explore' && opts.cats) { ui.ex = {...ui.ex, cats: opts.cats, open: false, diet: [], view: 'list', sel: ''}; ui.exploreQ = ''; }
  if (name === 'chat') ui.chatFresh = false;
  emit();
}

// After sign-in / sign-up: the interests screen the first time (once per browser profile), else Home.
export function enterApp() {
  if (!needsOnboarding()) return go('home', {replace:true});
  markOnboarded();   // shown once: Skip, Continue, back or a reload never bring it up again on its own
  go('interests', {replace:true});
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
  go('book', {keepView:true, push:true});
}

// Trip (Stage 3): a booking (ref) or a joined meetup ('m-' + id) of the timeline
export function openTripItem(id, opts = {}) {
  if (!tripEntry(id)) { toast('This trip item no longer exists'); return go('trip', {replace:true}); }
  ui.tripId = id;
  go('tripItem', opts);
}

function routeBook(path) {
  let v = Object.keys(BOOK_PATHS).find(k => BOOK_PATHS[k] === path);
  if (path.startsWith('hotel/')) { ui.ht.sel = path.slice(6); v = byHotel(ui.ht.sel) ? 'hotel' : ''; }
  if (!v || v === 'ride') return go('book', {replace:true});   // unknown step or a past ride: the hub
  stopRide();
  ui.bookView = v;
  go('book', {fromHistory:true, keepView:true});
}

function route() {
  closeSheet(true);
  const h = decodeURIComponent(location.hash.slice(1));
  if (h === 'profile/edit') go('editProfile', {fromHistory:true});
  else if (h.startsWith('place/')) openDetail(h.slice(6), {fromHistory:true});
  else if (h === 'meetups' || h.startsWith('meetups/')) openMeetups(h.slice(8), {fromHistory:true});
  else if (h.startsWith('book/')) routeBook(h.slice(5));
  else if (h.startsWith('trip/')) openTripItem(h.slice(5), {fromHistory:true});
  else if (h.startsWith('meetup/')) { const [id, sub] = h.slice(7).split('/'); (sub === 'chat' ? openChat : openMeetup)(id, {fromHistory:true}); }
  else go(h || (loggedIn() ? 'home' : 'login'), {fromHistory:true});
}

// Shows the screen for the current URL on start and follows the browser back/forward buttons.
export function useHashRouter() {
  useLayoutEffect(() => {
    const onPop = e => { const i = (e.state && e.state.i) || 0; popDir = i < navIdx ? 'back' : 'forward'; navIdx = i; route(); };
    window.addEventListener('popstate', onPop);
    route();
    return () => window.removeEventListener('popstate', onPop);
  }, []);
}
