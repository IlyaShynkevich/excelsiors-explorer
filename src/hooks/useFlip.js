import { useLayoutEffect, useRef } from 'react';
import { reducedMotion } from '../lib/motion.js';

// FLIP: when `key` changes (e.g. a filter), the elements matching `sel` inside the scroll box `ref`
// glide from where they were on screen to their new place instead of jumping. Only transform moves;
// elements that are new use their own entry animation (.stagger in motion.css).
export function useFlip(ref, sel, key) {
  const pos = useRef(new WeakMap());
  useLayoutEffect(() => {
    const box = ref.current;
    if (!box) return;
    // layout position (offsetTop ignores running transforms) minus the scroll = where it is on screen
    const y = el => { let t = 0; for (let e = el; e; e = e.offsetParent) t += e.offsetTop; return t - box.scrollTop; };
    const els = [...box.querySelectorAll(sel)], prev = pos.current, next = new WeakMap(), moved = [], far = box.clientHeight;
    els.forEach(el => {
      const now = y(el), dy = prev.has(el) ? prev.get(el) - now : 0;
      next.set(el, now);
      if (Math.abs(dy) < 1) return;
      el.style.transition = 'none';
      // from far outside the visible area it would fly across the screen: it fades in at its new place instead
      if (Math.abs(dy) > far) el.style.opacity = '0'; else el.style.transform = `translateY(${dy}px)`;
      moved.push(el);
    });
    pos.current = next;
    const reset = el => { el.style.transition = el.style.transform = el.style.opacity = ''; };
    if (!moved.length || reducedMotion()) return moved.forEach(reset);
    box.offsetHeight;   // apply the start positions, then let them go
    moved.forEach(el => {
      el.style.transition = 'transform var(--dur-base) var(--ease-out),opacity var(--dur-base) var(--ease-out)';
      el.style.transform = el.style.opacity = '';
      el.addEventListener('transitionend', () => { el.style.transition = ''; }, {once: true});
    });
  }, [key]);
}
