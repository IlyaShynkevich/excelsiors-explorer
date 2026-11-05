import { user } from '../state/userData.js';
import { openDetail } from '../hooks/useHashRouter.js';
import { byId } from '../data/places.js';
import { Photo } from '../components/Photo.jsx';
import { AppBar } from '../components/AppBar.jsx';

export function Saved() {
  const n = user.saved.length;
  return (
    <section className="screen active" id="saved">
      <AppBar>Excelsior Explorer</AppBar>
      <div className="scroll">
        <h1 className="ltitle">Saved</h1>
        <p className="hint" id="savedCount">{`You have saved ${n} destination${n === 1 ? '' : 's'}`}</p>
        <div className="grid2 stagger" id="savedGrid">
          {n ? user.saved.map(id => { const p = byId(id); return (
            <button className="saved-item" key={id} onClick={() => openDetail(id)}>
              <Photo className="img" p={p}><span className="dot"></span></Photo>
              <b>{p.name}</b><small>{p.area}</small>
            </button>); }) : <p className="muted">Nothing saved yet.</p>}
        </div>
        <h3 className="sec">Recently Viewed</h3>
        <div id="recentList" className="stagger">
          {['kadewe','museuminsel'].map(id => { const p = byId(id); return (
            <button className="recent-row" key={id} onClick={() => openDetail(id)}>
              <Photo className="thumb" p={p} />
              <div><b>{p.name}</b><small>{p.area}</small></div>
            </button>); })}
        </div>
      </div>
    </section>
  );
}
