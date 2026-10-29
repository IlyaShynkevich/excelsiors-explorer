import { useEffect, useRef } from 'react';
import { sheetOpen } from '../state/appStore.js';

// Pull-to-refresh: drag down at the top of any screen and let go to reload the app.
// Thanks to the URL routes you land back on the same screen, still logged in.
export function PullToRefresh() {
  const ref = useRef(null);
  useEffect(() => {
    const ptr = ref.current; let y0 = null, dy = 0, el = null;
    const start = e => {
      el = e.target.closest('.scroll');
      y0 = (el && el.scrollTop <= 0 && !sheetOpen()) ? e.touches[0].clientY : null; dy = 0;
    };
    const move = e => {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      if (el.scrollTop > 0) { y0 = null; dy = 0; }
      const d = Math.min(dy, 120);
      ptr.style.transform = `translateY(${d - 70}px) rotate(${d * 3}deg)`;
      ptr.style.opacity = Math.min(1, d / 80);
    };
    const end = () => {
      if (y0 === null) return;
      if (dy > 90) { ptr.classList.add('spin'); ptr.style.transform = 'translateY(20px)'; setTimeout(() => location.reload(), 350); }
      else { ptr.style.transition = '.2s'; ptr.style.transform = 'translateY(-70px)'; ptr.style.opacity = 0; setTimeout(() => ptr.style.transition = '', 200); }
      y0 = null;
    };
    document.addEventListener('touchstart', start, {passive:true});
    document.addEventListener('touchmove', move, {passive:true});
    document.addEventListener('touchend', end);
    return () => {
      document.removeEventListener('touchstart', start);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', end);
    };
  }, []);
  return <div className="ptr" id="ptr" ref={ref}><span>↻</span></div>;
}
