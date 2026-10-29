// ---------- Meetups (EE-28) & group chat (EE-20): simulated, stored in localStorage only ----------
import { ui, emit, toast, queueUnlocks, closeSheet } from './appStore.js';
import { user, persist, checkUnlocks, ME } from './userData.js';
import { MEETUPS, PEOPLE, REPLIES } from '../data/meetups.js';
import { openMeetup, openMeetups } from '../hooks/useHashRouter.js';

export const allMeetups = () => [...MEETUPS, ...user.myMeetups];
export const byMeetup = id => allMeetups().find(m => m.id === id);
export const upcomingMeetups = () => allMeetups().filter(m => m.start > Date.now() - 2 * 36e5);   // hide meetups that started over 2 h ago
export const isMine = m => m.host === 'me';
export const joinedM = m => user.joined.includes(m.id);
export const person = k => k === 'me' ? ME : PEOPLE[k];
export const going = m => [...m.people.map(person), ...(joinedM(m) && !isMine(m) ? [ME] : [])];

export const MT_FILTERS = [['all','All'],['today','Today'],['week','This week'],['joined','Joined']];
export function mtList() {
  const endToday = new Date().setHours(24,0,0,0), endWeek = endToday + 6 * 864e5;
  return upcomingMeetups()
    .filter(m => !ui.mtPlace || m.placeId === ui.mtPlace)
    .filter(m => ({all:true, today:m.start < endToday, week:m.start < endWeek, joined:joinedM(m)})[ui.mtFilter])
    .sort((a, b) => a.start - b.start);
}

export function toggleJoin(id) {
  const m = byMeetup(id); if (!m || isMine(m)) return;
  const i = user.joined.indexOf(id);
  if (i >= 0) { user.joined.splice(i, 1); persist(); toast('You left “' + m.title + '”'); }
  else {
    if (going(m).length >= m.max) return toast('Sorry, this meetup is full');
    user.joined.push(id);
    const fresh = checkUnlocks();
    if (fresh.length) queueUnlocks(fresh); else toast('You\'re in! Say hi in the group chat 👋');
  }
  emit();
}
export function createMeetup({title, placeId, start, max, note}) {
  const m = {id:'u' + Date.now().toString(36), title, placeId, start, max, host:'me', people:['me'],
             desc:note || 'No description yet – ask in the group chat!'};
  user.myMeetups.push(m); user.joined.push(m.id);
  const fresh = checkUnlocks();
  closeSheet(true);
  openMeetup(m.id);
  if (fresh.length) setTimeout(() => queueUnlocks(fresh), 300); else toast('Meetup created 🎉');
}
export function cancelMeetup(m) {
  user.myMeetups = user.myMeetups.filter(x => x.id !== m.id);
  user.joined = user.joined.filter(id => id !== m.id);
  delete user.chats[m.id]; persist();
  closeSheet(true); openMeetups('', {replace:true}); toast('Meetup cancelled');
}

// ----- group chat -----
// Seeded once, the first time someone who joined looks at it (idempotent afterwards).
export function chatOf(m) {
  if (!user.chats[m.id]) {
    const now = Date.now();
    user.chats[m.id] = (m.chat || []).map(([k, x, ago]) => ({n:PEOPLE[k].name, av:PEOPLE[k].av, x, t:now - ago * 6e4}));
    persist();
  }
  return user.chats[m.id];
}
export function sendMessage(m, text) {
  chatOf(m).push({me:true, x:text, t:Date.now()}); persist();
  ui.chatFresh = true; emit();
  simulateReply(m);
}
function simulateReply(m) {
  const pool = m.people.filter(k => k !== 'me');
  if (!pool.length || ui.typing[m.id]) return;      // nobody to answer, or someone is already typing
  const who = PEOPLE[pool[Math.random() * pool.length | 0]], text = REPLIES[Math.random() * REPLIES.length | 0];
  const onChat = () => ui.current === 'chat' && ui.meetupId === m.id;
  setTimeout(() => {
    ui.typing[m.id] = {n:who.name, av:who.av};
    if (onChat()) ui.chatFresh = false;
    emit();
    setTimeout(() => {
      delete ui.typing[m.id];
      if (!byMeetup(m.id) || !joinedM(m)) return emit();
      chatOf(m).push({n:who.name, av:who.av, x:text, t:Date.now()}); persist();
      if (onChat()) ui.chatFresh = true; else toast(`💬 ${who.name}: ${text}`);
      emit();
    }, 700 + Math.random() * 1600);
  }, 400);                                               // reply arrives 1.1–2.7 s after sending
}
