// Explore: search + filters (EE-43). Categories: a place matches if it has any selected category.
// "Open now": the current Berlin time. Dietary tags only apply to Food places, and a food place
// must have every selected tag (places from other selected categories are not affected).
import { ui, emit } from './appStore.js';
import { PLACES, POPULAR, RECENT, byId } from '../data/places.js';
import { getProfile } from './userData.js';
import { isOpenNow } from '../lib/hours.js';
import { kmToSpot } from './location.js';

export const filtersOn = () => !!(ui.ex.cats.length || ui.ex.open || ui.ex.diet.length);

export const EX_SORTS = [['default', 'Suggested'], ['near', 'Near me']];
// sort 'near' (EE-18): closest to the current location first (state/location.js)
export function exploreList() {
  const term = ui.exploreQ.trim().toLowerCase(), {cats, open, diet, sort} = ui.ex;
  const list = PLACES.filter(p => (!term || (p.name + ' ' + p.area).toLowerCase().includes(term))
    && (!cats.length || p.cats.some(c => cats.includes(c)))
    && (!open || isOpenNow(p))
    && (!diet.length || !p.cats.includes('food') || diet.every(d => p.diet.includes(d))));
  if (sort !== 'near') return list;
  const km = Object.fromEntries(list.map(p => [p.id, kmToSpot(p.id) ?? 999]));
  return list.sort((a, b) => km[a.id] - km[b.id]);
}
export function setSort(s) { ui.ex.sort = s; emit(); }

// "Suggested" (no search, no filter, default sort): the list in groups. Recently viewed (this session, else the demo
// list), For you (most matching interests; without interests a mix), Popular in Berlin, then every other place.
const MIX = ['eastside','museuminsel','tiergarten','markthalle','hackesche','curry36','tempelhof','charlottenburg'];
function forYou(interests) {
  if (!interests.length) return MIX.map(byId);
  return PLACES.map((p, i) => ({p, i, s: p.tags.filter(t => interests.includes(t)).length}))
    .filter(x => x.s > 0).sort((a, b) => b.s - a.s || a.i - b.i).map(x => x.p);
}
export const isSuggested = () => !ui.exploreQ.trim() && !filtersOn() && (ui.ex.sort || 'default') === 'default';
export function suggestedGroups() {
  const used = new Set(), take = (list, n) => list.filter(p => p && !used.has(p.id)).slice(0, n).map(p => (used.add(p.id), p));
  const recent = (ui.recent.length ? ui.recent : RECENT).map(byId);
  return [
    ['Recently viewed', take(recent, 3)],
    ['For you', take(forYou(getProfile().interests), 4)],
    ['Popular in Berlin', take(POPULAR.map(byId), 4)],
    ['More places', take(PLACES, PLACES.length)],
  ].filter(([, list]) => list.length);
}

const toggle = (list, k) => list.includes(k) ? list.filter(x => x !== k) : [...list, k];
export function toggleCat(k) {
  ui.ex.cats = toggle(ui.ex.cats, k);
  if (!ui.ex.cats.includes('food')) ui.ex.diet = [];   // the dietary row belongs to Food
  ui.ex.sel = ''; emit();
}
export function toggleDiet(k) { ui.ex.diet = toggle(ui.ex.diet, k); ui.ex.sel = ''; emit(); }
export function toggleOpen() { ui.ex.open = !ui.ex.open; ui.ex.sel = ''; emit(); }
export function setView(v) { ui.ex.view = v; ui.ex.sel = ''; emit(); }
export function selectPin(id) { ui.ex.sel = id; emit(); }
export function resetFilters() { ui.ex = {...ui.ex, cats: [], open: false, diet: [], sel: ''}; ui.exploreQ = ''; emit(); }
