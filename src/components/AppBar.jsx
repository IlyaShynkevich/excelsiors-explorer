import { useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { go, goBack } from '../hooks/useHashRouter.js';

// Top bar (HIG "large title" pattern): the screen shows its large title (.ltitle) or a photo at the top; the bar stays
// clear and empty, and once that element has scrolled under the bar, the bar turns frosted and shows the small `title`.
// back = screen to go to when there is no app history; watch = the element that hides the small title (default the
// large title, '.hero' etc. on detail pages); overlay = the bar floats over a photo (detail pages: round back button);
// children = small actions at the trailing edge (icons, "Edit").
export function AppBar({ back, onBack, title, watch = '.ltitle', overlay, children, id }) {
  const bar = useRef(null);
  useEffect(() => {
    const el = bar.current, scroll = el && el.parentElement.querySelector('.scroll');
    if (!scroll) return;
    let target, io = null;   // target undefined: the first attach always runs
    const set = on => el.classList.toggle('scrolled', on);
    const attach = () => {
      const t = scroll.querySelector(watch);
      if (t === target) return;
      if (io) io.disconnect();
      target = t;
      if (!t) return set(true);   // nothing to wait for: the small title shows at once
      const h = el.getBoundingClientRect().height;
      io = new IntersectionObserver(([e]) => set(!e.isIntersecting && e.boundingClientRect.top < h), {root: scroll, rootMargin: `-${h}px 0px 0px 0px`});
      io.observe(t);
    };
    attach();
    // the watched element can appear later (e.g. a screen that waits for data): look again when the content changes
    const mo = new MutationObserver(attach);
    mo.observe(scroll, {childList: true, subtree: true});
    return () => { mo.disconnect(); if (io) io.disconnect(); };
  }, [watch]);
  return (
    <div className={'appbar' + (overlay ? ' overlay' : '')} ref={bar} id={id}>
      {(back || onBack) && <BackButton to={back} onClick={onBack} />}
      <span className="ab-title">{title}</span>
      {children && <span className="ab-actions">{children}</span>}
    </div>
  );
}
export function BackButton({ to, onClick, ...rest }) {
  const click = onClick || (() => goBack(typeof to === 'function' ? to : () => go(to)));
  return <button className="back" aria-label="Back" onClick={click} {...rest}><ChevronLeft size={28} strokeWidth={2.2} aria-hidden="true" /></button>;
}
