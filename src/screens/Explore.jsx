import { ui, emit } from '../state/appStore.js';
import { PLACES } from '../data/places.js';
import { openDetail } from '../hooks/useHashRouter.js';
import { bg } from '../lib/format.js';
import { AppBar } from '../components/AppBar.jsx';

export function Explore() {
  const term = ui.exploreQ.trim().toLowerCase();
  const list = PLACES.filter(p => !term || (p.name + ' ' + p.area).toLowerCase().includes(term));
  return (
    <section className="screen active" id="explore">
      <AppBar>Excelsior Explorer</AppBar>
      <div className="scroll">
        <h1 className="ltitle">Explore</h1>
        <input className="search" id="exploreSearch" placeholder="Search destinations..." type="search" value={ui.exploreQ}
               onChange={e => { ui.exploreQ = e.target.value; emit(); }} />
        <div className="count" id="count">{`${list.length} result${list.length === 1 ? '' : 's'} found`}</div>
        <div id="results">
          {list.length ? list.map(p => (
            <button className="card" key={p.id} onClick={() => openDetail(p.id)}>
              <div className="img" style={{background: bg(p)}}></div>
              <div className="body">
                {p.km ? <span className="km">{p.km + ' km'}</span> : null}
                <h4>{`${p.name}, ${p.area}`}</h4>
                <p>{p.short}</p>
              </div>
            </button>
          )) : <div className="empty">{`No destinations match “${term}”.`}</div>}
        </div>
      </div>
    </section>
  );
}
