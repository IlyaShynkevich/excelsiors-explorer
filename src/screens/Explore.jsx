import { useRef } from 'react';
import { ui, emit } from '../state/appStore.js';
import { exploreList, filtersOn, toggleCat, toggleDiet, toggleOpen, setView, selectPin, resetFilters, setSort, EX_SORTS } from '../state/explore.js';
import { here, distLabel, isNearby } from '../state/location.js';
import { CATEGORIES, DIETS } from '../data/places.js';
import { go, openDetail } from '../hooks/useHashRouter.js';
import { isOpenNow } from '../lib/hours.js';
import { AppBar } from '../components/AppBar.jsx';
import { FilterChips } from '../components/FilterChips.jsx';
import { PlaceMeta, DietTags } from '../components/PlaceMeta.jsx';
import { PlaceMap } from '../components/PlaceMap.jsx';
import { Photo } from '../components/Photo.jsx';
import { useFlip } from '../hooks/useFlip.js';

export function Explore() {
  const term = ui.exploreQ.trim().toLowerCase(), ex = ui.ex, list = exploreList();
  const food = ex.cats.includes('food'), box = useRef(null);
  // filter / search changes: the list glides to its new layout instead of jumping
  useFlip(box, '.count-row, #results > .card, .map-wrap, .empty', list.map(p => p.id).join() + '|' + food + ex.view);
  const h = here();
  return (
    <section className="screen active" id="explore">
      <AppBar>Excelsior Explorer</AppBar>
      <div className="scroll" ref={box}>
        <h1 className="ltitle">Explore</h1>
        <button className="loc-line" id="exLoc" onClick={() => go('location')}>
          <span aria-hidden="true">📍</span><span className="nm"><small>{'Where am I? · ' + (h.real ? 'real location' : 'demo location')}</small><b>{h.name}</b></span>
          <span className="chev">›</span>
        </button>
        <input className="search" id="exploreSearch" placeholder="Search destinations..." type="search" value={ui.exploreQ}
               onChange={e => { ui.exploreQ = e.target.value; ui.ex.sel = ''; emit(); }} />
        <div className="seg ex-view" role="tablist" aria-label="View">
          {[['list','☰ List'],['map','🗺️ Map']].map(([k, l]) =>
            <button key={k} role="tab" aria-selected={ex.view === k} className={ex.view === k ? 'on' : ''} onClick={() => setView(k)}>{l}</button>)}
        </div>
        <FilterChips id="exCats" label="Filter by category" options={CATEGORIES} value={ex.cats} onChange={toggleCat}>
          <button type="button" className={'open-chip' + (ex.open ? ' on' : '')} aria-pressed={ex.open} onClick={toggleOpen}>🕒 Open now</button>
        </FilterChips>
        {food && <div className="diet-row">
          <FilterChips id="exDiet" label="Dietary" options={DIETS} value={ex.diet} onChange={toggleDiet}>
            <span className="chips-label">Dietary</span>
          </FilterChips>
          <p className="note diet-note">Dietary tags are indicative, check with the venue.</p>
        </div>}
        <div className="seg seg-sm ex-sort" id="exSort" role="group" aria-label="Sort places">{EX_SORTS.map(([k, l]) =>
          <button key={k} className={(ex.sort || 'default') === k ? 'on' : ''} aria-pressed={(ex.sort || 'default') === k} onClick={() => setSort(k)}>{l}</button>)}</div>
        <div className="count-row">
          <div className="count" id="count">{`${list.length} result${list.length === 1 ? '' : 's'} found`}</div>
          {filtersOn() && list.length > 0 && <button className="link-btn" onClick={resetFilters}>Reset filters</button>}
        </div>
        {!list.length ? <Empty term={term} />
          : ex.view === 'map' ? <PlaceMap places={list} sel={ex.sel} onSelect={selectPin} onShowList={() => setView('list')} />
          : <div id="results" className="stagger">{list.map(p => (
              <button className="card" key={p.id} onClick={() => openDetail(p.id)}>
                <Photo className="img" p={p} />
                <div className="body">
                  <span className="km">{distLabel(p.id)}</span>
                  {isNearby(p.id) && <span className="fl-badge near-tag">Nearby</span>}
                  <h4>{`${p.name}, ${p.area}`}</h4>
                  <PlaceMeta p={p} open={isOpenNow(p)} />
                  <p>{p.short}</p>
                  <DietTags p={p} />
                </div>
              </button>))}
            </div>}
      </div>
    </section>
  );
}

function Empty({ term }) {
  if (!filtersOn()) return <div className="empty">{`No destinations match “${term}”.`}</div>;
  return (
    <div className="empty" id="exEmpty">
      <div className="empty-ico" aria-hidden="true">🔍</div>
      <b>No places match these filters</b>
      <p>{term ? `Nothing for “${term}” with the filters you picked.` : 'Try fewer categories or turn off “Open now”.'}</p>
      <button className="pill" onClick={resetFilters}>Reset filters</button>
    </div>
  );
}
