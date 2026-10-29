// Achievements: leaderboard, check-ins, saving places, demo reset
import { ui, emit, toast, queueUnlocks } from './appStore.js';
import { user, ME, myBadges, checkUnlocks } from './userData.js';
import { FRIENDS } from '../data/badges.js';
import { byId } from '../data/places.js';
import { openDetail } from '../hooks/useHashRouter.js';

// Friends + you, most badges first (you win ties). Your row has me: true.
export function leaderboard() {
  const rows = FRIENDS.map((f, idx) => ({...f, idx}));
  rows.push({name:ME.name, me:true, badges:myBadges()});
  return rows.sort((a, b) => b.badges.length - a.badges.length || (a.me ? -1 : b.me ? 1 : 0));
}
export function resetProgress() { user.visited = []; user.unlocked = {}; checkUnlocks(); emit(); toast('Progress reset'); }

export function checkIn(id) {
  if (user.visited.includes(id)) return;
  user.visited.push(id);
  const fresh = checkUnlocks();
  openDetail(id, {replace:true});
  if (fresh.length) queueUnlocks(fresh); else toast('Checked in at ' + byId(id).name);
}
export function toggleSave(id) {
  const i = user.saved.indexOf(id);
  if (i >= 0) { user.saved.splice(i,1); toast('Removed from saved'); } else { user.saved.push(id); toast('Saved!'); }
  const fresh = checkUnlocks();
  openDetail(id, {replace:true});
  if (fresh.length) queueUnlocks(fresh);
}
export const setAchTab = t => { ui.achTab = t; emit(); };
