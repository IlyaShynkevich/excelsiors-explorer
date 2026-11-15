import { ui, openSheet } from '../state/appStore.js';
import { user, ME, isEarned, myBadges } from '../state/userData.js';
import { leaderboard, resetProgress, setAchTab } from '../state/achievements.js';
import { BADGES, byBadge } from '../data/badges.js';
import { AppBar } from '../components/AppBar.jsx';
import { Badge } from '../components/Badge.jsx';
import { avNode } from '../components/Avatar.jsx';
import { QuestList, Streak } from '../components/Quests.jsx';
import { todaysQuests, streak, totalPoints, questHistory } from '../state/challenges.js';
import { appToday, demoDays } from '../state/clock.js';
import { niceDate } from '../lib/format.js';
import { go } from '../hooks/useHashRouter.js';

export function Achievements() {
  return (
    <section className="screen active" id="achievements">
      <AppBar back="profile" title="Achievements" />
      <div className="scroll">
        <h1 className="ltitle">Achievements</h1>
        <div className="tabs" id="achTabs">
          <button className={ui.achTab === 'badges' ? 'on' : ''} onClick={() => setAchTab('badges')}>{`Badges · ${myBadges().length}`}</button>
          <button className={ui.achTab === 'challenges' ? 'on' : ''} onClick={() => setAchTab('challenges')}>Challenges</button>
          <button className={ui.achTab === 'leaderboard' ? 'on' : ''} onClick={() => setAchTab('leaderboard')}>Leaderboard</button>
        </div>
        <div id="achBody" key={ui.achTab}>{ui.achTab === 'badges' ? <Badges /> : ui.achTab === 'challenges' ? <Challenges /> : <Leaderboard />}</div>
      </div>
    </section>
  );
}

function Badges() {
  const n = myBadges().length;
  return (<>
    <div className="ach-head"><div className="big">{n}<span className="of">{` / ${BADGES.length}`}</span></div></div>
    <div className="bar"><i style={{width: `${n / BADGES.length * 100}%`}}></i></div>
    <div className="badge-grid stagger">{BADGES.map(b => {
      const e = isEarned(b.id), [p, t] = b.goal(user);
      return <button className="badge-cell" key={b.id} onClick={() => openSheet('badge', {b})}><Badge b={b} earned={e} /><b>{b.name}</b><small>{e ? 'Earned' : `${p} / ${t}`}</small></button>;
    })}</div>
  </>);
}

// Stage 4: today's 3 quests, points and the streak (🔥 consecutive days with at least one completed quest)
function Challenges() {
  const s = streak(), hist = questHistory(5);
  return (<>
    <div className="ch-stats">
      <div><Streak n={s} big /><small>{s === 1 ? 'day streak' : 'days streak'}</small></div>
      <div><b className="ch-big">{totalPoints()}</b><small>points total</small></div>
    </div>
    <h2 className="sec ch-title">{`Today · ${niceDate(appToday())}${demoDays() ? ' (demo date)' : ''}`}</h2>
    <div className="ch-card static"><QuestList quests={todaysQuests()} /></div>
    <p className="hint">Check in with “I'm here” to complete them.</p>
    {hist.length > 0 && <>
      <h2 className="sec">Recent days</h2>
      <div className="ch-hist">{hist.map(d => (
        <div key={d.date}><span>{niceDate(d.date)}</span><span>{`${d.n} / 3 · ${d.pts} pts`}</span></div>
      ))}</div>
    </>}
  </>);
}

const medal = i => ['🥇','🥈','🥉'][i] || (i + 1);
function Leaderboard() {
  return (<>
    <div className="stagger">{leaderboard().map((r, i) => (
      <button className={`lb-row ${r.me ? 'me' : ''}`} key={r.me ? 'me' : r.idx} onClick={r.me ? undefined : () => openSheet('compare', {f: r})}>
        <span className="lb-pos">{medal(i)}</span><span className="lb-av">{r.me ? avNode(ME) : r.av}</span>
        <span className="nm"><b>{r.name + (r.me ? ' (you)' : '')}</b><small>{r.badges.length ? r.badges.slice(0, 3).map(id => byBadge(id).icon).join(' ') + (r.badges.length > 3 ? ` +${r.badges.length - 3}` : '') : 'No badges yet'}</small></span>
        <span className="lb-score">{r.badges.length}</span>
      </button>
    ))}</div>
  </>);
}
