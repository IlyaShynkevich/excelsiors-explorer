import { user } from '../state/userData.js';
import { openDetail } from '../hooks/useHashRouter.js';
import { byId } from '../data/places.js';
import { Photo } from '../components/Photo.jsx';
import { AppBar } from '../components/AppBar.jsx';

export function Saved() {
  const n = user.saved.length;
  return (
    <section className="screen active" id="saved">
      <AppBar back="profile" title="Saved" />
      <div className="scroll">
        <h1 className="ltitle">Saved</h1>
        <div className="grid2 stagger" id="savedGrid">
          {n ? user.saved.map(id => { const p = byId(id); return (
            <button className="saved-item" key={id} onClick={() => openDetail(id)}>
              <Photo className="img" size="tile" p={p} />
              <b>{p.name}</b><small>{p.area}</small>
            </button>); }) : <p className="muted">Nothing saved yet. Tap Save on a place.</p>}
        </div>
      </div>
    </section>
  );
}
