import { ui, openSheet } from '../state/appStore.js';
import { user, ME, isEarned, myBadges } from '../state/userData.js';
import { leaderboard, resetProgress, setAchTab } from '../state/achievements.js';
import { BADGES, byBadge } from '../data/badges.js';
import { AppBar } from '../components/AppBar.jsx';
import { Badge } from '../components/Badge.jsx';
import { avNode } from '../components/Avatar.jsx';

export function Achievements() {
  return (
    <section className="screen active" id="achievements">
      <AppBar back="profile">Achievements</AppBar>
      <div className="scroll">
        <div className="tabs" id="achTabs">
          <button className={ui.achTab === 'badges' ? 'on' : ''} onClick={() => setAchTab('badges')}>Badges</button>
          <button className={ui.achTab === 'leaderboard' ? 'on' : ''} onClick={() => setAchTab('leaderboard')}>Leaderboard</button>
        </div>
        <div id="achBody">{ui.achTab === 'badges' ? <Badges /> : <Leaderboard />}</div>
      </div>
    </section>
  );
}

function Badges() {
  const n = myBadges().length;
  return (<>
    <div className="ach-head"><div className="big">{n}<span style={{fontSize: '18px', color: 'var(--muted)'}}>{` / ${BADGES.length}`}</span></div>
      <small className="muted">badges collected · check in at places to earn more</small></div>
    <div className="bar"><i style={{width: `${n / BADGES.length * 100}%`}}></i></div>
    <div className="badge-grid">{BADGES.map(b => {
      const e = isEarned(b.id), [p, t] = b.goal(user);
      return <button className="badge-cell" key={b.id} onClick={() => openSheet('badge', {b})}><Badge b={b} earned={e} /><b>{b.name}</b><small>{e ? 'Earned' : `${p} / ${t}`}</small></button>;
    })}</div>
    <p className="alt" style={{marginTop: 'var(--s6)'}}><a id="resetAch" onClick={resetProgress}>Reset progress (demo)</a></p>
  </>);
}

const medal = i => ['🥇','🥈','🥉'][i] || (i + 1);
function Leaderboard() {
  return (<>
    <p className="hint">Friends ranked by badges collected. Tap someone to compare.</p>
    {leaderboard().map((r, i) => (
      <button className={`lb-row ${r.me ? 'me' : ''}`} key={r.me ? 'me' : r.idx} onClick={r.me ? undefined : () => openSheet('compare', {f: r})}>
        <span className="lb-pos">{medal(i)}</span><span className="lb-av">{r.me ? avNode(ME) : r.av}</span>
        <span className="nm"><b>{r.name + (r.me ? ' (you)' : '')}</b><small>{r.badges.map(id => byBadge(id).icon).join(' ') || 'No badges yet'}</small></span>
        <span className="lb-score">{r.badges.length}</span>
      </button>
    ))}
  </>);
}
