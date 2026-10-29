import { user } from '../state/userData.js';
import { openDetail } from '../hooks/useHashRouter.js';
import { byId } from '../data/places.js';
import { bg } from '../lib/format.js';
import { AppBar } from '../components/AppBar.jsx';

export function Saved() {
  const n = user.saved.length;
  return (
    <section className="screen active" id="saved">
      <AppBar>Excelsior Explorer</AppBar>
      <div className="scroll">
        <h1 className="ltitle">Saved</h1>
        <p className="hint" id="savedCount">{`You have saved ${n} destination${n === 1 ? '' : 's'}`}</p>
        <div className="grid2" id="savedGrid">
          {n ? user.saved.map(id => { const p = byId(id); return (
            <button className="saved-item" key={id} onClick={() => openDetail(id)}>
              <div className="img" style={{background: bg(p)}}><span className="dot"></span></div>
              <b>{p.name}</b><small>{p.area}</small>
            </button>); }) : <p className="muted">Nothing saved yet.</p>}
        </div>
        <h3 className="sec">Recently Viewed</h3>
        <div id="recentList">
          {['kadewe','museuminsel'].map(id => { const p = byId(id); return (
            <button className="recent-row" key={id} onClick={() => openDetail(id)}>
              <div className="thumb" style={{background: bg(p)}}></div>
              <div><b>{p.name}</b><small>{p.area}</small></div>
            </button>); })}
        </div>
      </div>
    </section>
  );
}
