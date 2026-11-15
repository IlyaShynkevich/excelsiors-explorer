import { lazy, createElement } from 'react';

// A screen whose code is its own build file (React.lazy), loaded the first time it is shown.
// load = () => import('./screens/X.jsx'), name = the exported component.
// preload() fetches it ahead of time (App does that when the browser is idle). Once loaded, the screen renders
// directly instead of through React.lazy: lazy() suspends once even for a loaded file, which would show the
// skeleton for a frame and cut the screen transition (lib/motion.js) short.
export function lazyScreen(load, name) {
  let Comp = null, promise = null;
  const preload = () => promise || (promise = load().then(m => { Comp = m[name]; return m; }, err => { promise = null; throw err; }));
  const Lazy = lazy(() => preload().then(m => ({default: m[name]})));
  const Screen = props => createElement(Comp || Lazy, props);
  Screen.preload = () => preload().catch(() => {});
  return Screen;
}
