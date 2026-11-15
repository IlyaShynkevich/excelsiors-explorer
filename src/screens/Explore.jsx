import { useRef } from 'react';
import { Map as MapIcon, List, MapPin, ChevronDown, Clock } from 'lucide-react';
import { ui, emit } from '../state/appStore.js';
import { exploreList, filtersOn, toggleCat, toggleDiet, toggleOpen, setView, selectPin, resetFilters, setSort, EX_SORTS, isSuggested, suggestedGroups } from '../state/explore.js';
import { here, distLabel } from '../state/location.js';
import { CATEGORIES, DIETS } from '../data/places.js';
import { go, openDetail } from '../hooks/useHashRouter.js';
import { isOpenNow } from '../lib/hours.js';
import { AppBar } from '../components/AppBar.jsx';
import { FilterChips } from '../components/FilterChips.jsx';
import { PlaceMeta } from '../components/PlaceMeta.jsx';
import { PlaceMap } from '../components/PlaceMap.jsx';
import { Photo } from '../components/Photo.jsx';
import { useFlip } from '../hooks/useFlip.js';

// Explore – one job: find a place. Search (location as a pill), one chip row, the results line with "Sort", cards.
// List/Map is the icon in the top bar. Without search/filters the list is grouped ("Suggested": recently viewed,
// for you, popular, more places).
export function Explore() {
  const term = ui.exploreQ.trim().toLowerCase(), ex = ui.ex, list = exploreList();
  const food = ex.cats.includes('food'), box = useRef(null), map = ex.view === 'map';
  const groups = !map && isSuggested() ? suggestedGroups() : null;
  // filter / search changes: the list glides to its new layout instead of jumping
  useFlip(box, '.count-row, #results > *, .map-wrap, .empty', list.map(p => p.id).join() + '|' + food + ex.view + !!groups);
  const h = here(), sort = ex.sort || 'default';
  let n = 0;   // card index: the first card is the screen's largest paint (fetchpriority)
  const card = p => (
    <button className="card ex-card" key={p.id} onClick={() => openDetail(p.id)}>
      <Photo className="img" size="card" priority={n++ === 0} p={p} />
      <span className="body"><h2>{p.name}</h2><PlaceMeta p={p} dist={distLabel(p.id)} open={isOpenNow(p)} /></span>
    </button>
  );
  return (
    <section className="screen active" id="explore">
      <AppBar title="Explore">
        <button className="ab-icon" id="exViewBtn" aria-label={map ? 'Show list' : 'Show map'} onClick={() => setView(map ? 'list' : 'map')}>
          {map ? <List size={22} aria-hidden="true" /> : <MapIcon size={22} aria-hidden="true" />}</button>
      </AppBar>
      <div className="scroll" ref={box}>
        <h1 className="ltitle">Explore</h1>
        <div className="search-wrap">
          <input className="search" id="exploreSearch" placeholder="Search places" aria-label="Search places" type="search" value={ui.exploreQ}
                 onChange={e => { ui.exploreQ = e.target.value; ui.ex.sel = ''; emit(); }} />
          <button className="loc-pill in-search" id="exLoc" onClick={() => go('location')} aria-label={`Location: ${h.name}. Change`}>
            <MapPin size={14} aria-hidden="true" /><span>{h.name}</span></button>
        </div>
        <FilterChips id="exCats" label="Filter by category" options={CATEGORIES} value={ex.cats} onChange={toggleCat}>
          <button type="button" className={'open-chip' + (ex.open ? ' on' : '')} aria-pressed={ex.open} onClick={toggleOpen}><Clock size={15} aria-hidden="true" />Open now</button>
        </FilterChips>
        {food && <div className="diet-row">
          <FilterChips id="exDiet" label="Dietary" options={DIETS} value={ex.diet} onChange={toggleDiet}>
            <span className="chips-label">Dietary</span>
          </FilterChips>
        </div>}
        <div className="count-row">
          <div className="count" id="count">{`${list.length} place${list.length === 1 ? '' : 's'}`}</div>
          {filtersOn() && list.length > 0 && <button className="link-btn" onClick={resetFilters}>Reset filters</button>}
          {/* "Sort ▾": a native menu (pull-down) over the label */}
          <label className="sort-sel" id="exSort">
            <span>{sort === 'default' ? 'Sort' : EX_SORTS.find(s => s[0] === sort)[1]}</span><ChevronDown size={14} aria-hidden="true" />
            <select aria-label="Sort places" value={sort} onChange={e => setSort(e.target.value)}>
              {EX_SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </label>
        </div>
        {!list.length ? <Empty term={term} />
          : map ? <PlaceMap places={list} sel={ex.sel} onSelect={selectPin} onShowList={() => setView('list')} />
          : <div id="results" className="stagger">{groups
              ? groups.map(([label, ps]) => [<h2 className="grp" key={'g' + label}>{label}</h2>, ...ps.map(card)])
              : list.map(card)}
            </div>}
      </div>
    </section>
  );
}

function Empty({ term }) {
  if (!filtersOn()) return <div className="empty">{`No places match “${term}”.`}</div>;
  return (
    <div className="empty" id="exEmpty">
      <b>No places match these filters</b>
      <p>{term ? `Nothing for “${term}” with these filters.` : 'Try fewer filters.'}</p>
      <button className="pill" onClick={resetFilters}>Reset filters</button>
    </div>
  );
}
