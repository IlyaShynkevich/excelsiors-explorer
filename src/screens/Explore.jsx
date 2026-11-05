import { ui, emit } from '../state/appStore.js';
import { exploreList, filtersOn, toggleCat, toggleDiet, toggleOpen, setView, selectPin, resetFilters } from '../state/explore.js';
import { CATEGORIES, DIETS } from '../data/places.js';
import { openDetail } from '../hooks/useHashRouter.js';
import { bg } from '../lib/format.js';
import { isOpenNow } from '../lib/hours.js';
import { AppBar } from '../components/AppBar.jsx';
import { FilterChips } from '../components/FilterChips.jsx';
import { PlaceMeta, DietTags } from '../components/PlaceMeta.jsx';
import { PlaceMap } from '../components/PlaceMap.jsx';

export function Explore() {
  const term = ui.exploreQ.trim().toLowerCase(), ex = ui.ex, list = exploreList();
  const food = ex.cats.includes('food');
  return (
    <section className="screen active" id="explore">
      <AppBar>Excelsior Explorer</AppBar>
      <div className="scroll">
        <h1 className="ltitle">Explore</h1>
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
        <div className="count-row">
          <div className="count" id="count">{`${list.length} result${list.length === 1 ? '' : 's'} found`}</div>
          {filtersOn() && list.length > 0 && <button className="link-btn" onClick={resetFilters}>Reset filters</button>}
        </div>
        {!list.length ? <Empty term={term} />
          : ex.view === 'map' ? <PlaceMap places={list} sel={ex.sel} onSelect={selectPin} onShowList={() => setView('list')} />
          : <div id="results">{list.map(p => (
              <button className="card" key={p.id} onClick={() => openDetail(p.id)}>
                <div className="img" style={{background: bg(p)}}></div>
                <div className="body">
                  {p.km ? <span className="km">{p.km + ' km'}</span> : null}
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
