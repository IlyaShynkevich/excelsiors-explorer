import { useEffect } from 'react';
import { closeSheet, toast } from '../../state/appStore.js';
import { user, ME, isEarned, myBadges } from '../../state/userData.js';
import { BADGES } from '../../data/badges.js';
import { Badge } from '../Badge.jsx';
import { avNode } from '../Avatar.jsx';
import { reducedMotion, motionMs } from '../../lib/motion.js';

// A light confetti burst from the unlocked badge: ~20 plain DOM pieces in the sheet layer, removed afterwards.
// Off with reduced motion.
const COLORS = ['#0b7a2b', '#3cc46a', '#facc15', '#0a84ff', '#ff2d55', '#ff9500'];
function burst() {
  const host = document.getElementById('sheet'), badge = host && host.querySelector('.badge.pop');
  if (!badge || reducedMotion()) return null;
  const h = host.getBoundingClientRect(), r = badge.getBoundingClientRect();
  const box = document.createElement('div');
  box.className = 'confetti';
  box.setAttribute('aria-hidden', 'true');
  box.style.left = (r.left + r.width / 2 - h.left) + 'px';
  box.style.top = (r.top + r.height / 2 - h.top) + 'px';
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + Math.random() * .3, d = 60 + Math.random() * 70, el = document.createElement('i');
    el.style.cssText = `--x:${Math.cos(a) * d | 0}px;--y:${(Math.sin(a) * d * .8 - 20) | 0}px;--r:${(Math.random() * 540 - 270) | 0}deg;`
      + `--d:${Math.random() * 80 | 0}ms;background:${COLORS[i % COLORS.length]}`;
    box.append(el);
  }
  host.append(box);
  return box;
}
function Confetti() {
  useEffect(() => {
    let box = null;
    // when the badge pops (180 ms delay + about half of --dur-pop), removed after --dur-confetti (+ the 80 ms spread)
    const at = 180 + motionMs('pop') * .45;
    const t = setTimeout(() => { box = burst(); }, at);
    const t2 = setTimeout(() => { if (box) box.remove(); }, at + motionMs('confetti') + 150);
    return () => { clearTimeout(t); clearTimeout(t2); if (box) box.remove(); };
  }, []);
  return null;
}

async function flex(b) {
  const text = `I just earned the "${b.name}" ${b.icon} badge on Excelsior Explorer! ${myBadges().length}/${BADGES.length} badges collected. Can you beat me?`;
  try { if (navigator.share) { await navigator.share({title:'Excelsior Explorer', text}); return; } }
  catch (e) { if (e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(text); toast('Copied – paste it anywhere to flex'); }
  catch (e) { toast('Sharing not supported here'); }
}

export function UnlockSheet({ b }) {
  return (<>
    <Badge b={b} earned cls="pop" />
    <Confetti />
    <div className="kicker">🎉 Badge unlocked</div>
    <h3>{b.name}</h3>
    <p>{b.desc}<br />{`Only ${b.rarity}% of travelers have this badge.`}</p>
    <button className="btn" onClick={() => flex(b)}>Flex it 💪</button>
    <button className="btn ghost" onClick={() => closeSheet()}>Nice!</button>
  </>);
}

export function BadgeSheet({ b }) {
  const e = isEarned(b.id), [p, t] = b.goal(user);
  const date = e ? new Date(user.unlocked[b.id]).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'}) : '';
  return (<>
    <Badge b={b} earned={e} />
    <h3>{b.name}</h3>
    <p>{b.desc}</p>
    {e ? <>
      <p>{`Earned on ${date} · ${b.rarity}% of travelers have it`}</p>
      <button className="btn" onClick={() => flex(b)}>Flex it 💪</button>
    </> : <>
      <div className="bar"><i style={{width: `${p / t * 100}%`}}></i></div>
      <p>{`Progress: ${p} / ${t} · ${b.rarity}% of travelers have it`}</p>
    </>}
    <button className="btn ghost" onClick={() => closeSheet()}>Close</button>
  </>);
}

export function CompareSheet({ f }) {
  const mine = myBadges();
  const onlyMe = mine.filter(id => !f.badges.includes(id)).length;
  const onlyThem = f.badges.filter(id => !mine.includes(id)).length;
  const mark = on => <span className="c" style={{color: on ? 'var(--accent)' : 'var(--muted)'}}>{on ? '✓' : '–'}</span>;
  return (<>
    <h3>{`You vs ${f.name}`}</h3>
    <div className="vs">
      <div><div className="s">{mine.length}</div>{avNode(ME)}<small>You</small></div>
      <div className="muted" style={{fontWeight: 700}}>VS</div>
      <div><div className="s">{f.badges.length}</div><small>{`${f.av} ${f.name}`}</small></div>
    </div>
    <p>{`${onlyMe} badge${onlyMe === 1 ? '' : 's'} only you have · ${onlyThem} only they have`}</p>
    <div className="cmp-head"><span className="n">Badge</span><span className="c">You</span><span className="c">{f.av}</span></div>
    {BADGES.map(b => {
      const a = mine.includes(b.id), c = f.badges.includes(b.id);
      return <div className="cmp-row" key={b.id}><Badge b={b} earned={a || c} /><span className="n">{b.name}</span>{mark(a)}{mark(c)}</div>;
    })}
    <button className="btn ghost" style={{marginTop: 'var(--s4)'}} onClick={() => closeSheet()}>Close</button>
  </>);
}
