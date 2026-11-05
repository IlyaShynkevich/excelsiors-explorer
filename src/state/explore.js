// Explore: search + filters (EE-43). Categories: a place matches if it has any selected category.
// "Open now": the current Berlin time. Dietary tags only apply to Food places, and a food place
// must have every selected tag (places from other selected categories are not affected).
import { ui, emit } from './appStore.js';
import { PLACES } from '../data/places.js';
import { isOpenNow } from '../lib/hours.js';

export const filtersOn = () => !!(ui.ex.cats.length || ui.ex.open || ui.ex.diet.length);

export function exploreList() {
  const term = ui.exploreQ.trim().toLowerCase(), {cats, open, diet} = ui.ex;
  return PLACES.filter(p => (!term || (p.name + ' ' + p.area).toLowerCase().includes(term))
    && (!cats.length || p.cats.some(c => cats.includes(c)))
    && (!open || isOpenNow(p))
    && (!diet.length || !p.cats.includes('food') || diet.every(d => p.diet.includes(d))));
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
