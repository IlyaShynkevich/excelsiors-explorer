// ---------- Motion helpers (the animations themselves are CSS, see styles/motion.css) ----------
const ROOT = document.documentElement;

// The OS "Reduce motion" setting, or ?motion=reduce in the URL (test switch, set in main.jsx)
export const reducedMotion = () =>
  ROOT.classList.contains('reduce-motion') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

// A duration token from base.css :root in ms, e.g. motionMs('sheet-out') reads --dur-sheet-out.
// 0 with reduced motion, so JS timers that wait for an animation don't wait at all.
export function motionMs(name) {
  if (reducedMotion()) return 0;
  const v = getComputedStyle(ROOT).getPropertyValue('--dur-' + name).trim(), n = parseFloat(v) || 0;
  return /\ds$/.test(v) && !/ms$/.test(v) ? n * 1000 : n;
}

// ---------- Screen transitions ----------
// go() calls navStart(dir) while the old screen is still in the DOM: it is copied into #navfx as a static,
// inert picture (the real screens read the global state, so the old one can't stay mounted). App calls
// navPlay() right after the new screen is in the DOM, before the browser paints.
// dir: 'forward' (new screen slides in from the right), 'back' (the old one slides out to the right),
// 'tab' / 'fade' (cross-fade) or 'none' (no animation, e.g. tapping the current tab again).
let ready = false, pending = null, timer = 0;
export const motionReady = () => { ready = true; };   // not on the first render after a (re)load
const SLIDE = ['in-forward', 'in-back'];
const SCROLLERS = '.scroll,.hscroll,.chips';

function finish() {
  clearTimeout(timer);
  const fx = document.getElementById('navfx');
  if (fx) { fx.replaceChildren(); fx.className = ''; }
  document.querySelectorAll('#app > .in-forward, #app > .in-back').forEach(el => el.classList.remove(...SLIDE));
}

export function navStart(dir) {
  finish(); pending = null;
  const fx = document.getElementById('navfx'), old = document.querySelector('#app > .screen');
  if (!ready || dir === 'none' || !fx || !old || reducedMotion()) return;
  const ghost = document.createElement('div');
  ghost.className = 'nav-ghost';
  ghost.setAttribute('inert', '');
  const copy = old.cloneNode(true);
  ghost.append(copy);
  const nav = document.getElementById('nav');
  if (nav && nav.classList.contains('show')) { const n = nav.cloneNode(true); n.removeAttribute('id'); ghost.append(n); }
  fx.append(ghost);
  // cloneNode doesn't keep scroll positions
  const from = old.querySelectorAll(SCROLLERS), to = copy.querySelectorAll(SCROLLERS);
  from.forEach((el, i) => { if (to[i] && (el.scrollTop || el.scrollLeft)) { to[i].scrollTop = el.scrollTop; to[i].scrollLeft = el.scrollLeft; } });
  pending = {dir, ghost};
}

// navShown: the tab bar is visible on the new screen (it then moves together with the screen)
export function navPlay(navShown) {
  const p = pending; pending = null;
  if (!p) return;
  const fx = document.getElementById('navfx'), scr = document.querySelector('#app > .screen'), nav = document.getElementById('nav');
  const slide = p.dir === 'forward' || p.dir === 'back';
  fx.className = p.dir === 'forward' ? 'under' : 'over';   // forward: the new screen covers the old one
  p.ghost.classList.add('out-' + p.dir);
  if (slide) [scr, navShown && nav].forEach(el => el && el.classList.add('in-' + p.dir));
  p.ghost.addEventListener('animationend', e => { if (e.target === p.ghost && fx.contains(p.ghost)) finish(); });
  timer = setTimeout(finish, motionMs(slide ? 'nav' : p.dir === 'tab' ? 'tab' : 'base') + 150);   // fallback, e.g. if the tab is in the background
}
