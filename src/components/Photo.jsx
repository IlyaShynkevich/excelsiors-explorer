import { useEffect, useRef, useState } from 'react';
import { photoAttrs } from '../lib/photo.js';

// Place / hotel photo (Wikimedia Commons). The colour gradient p.g is the element's own background (also what you
// see offline or when a photo fails); the photo is an <img> behind the content (styles/motion.css) that fades in
// once loaded, with a soft shimmer until then. shade = dark gradient at the bottom for white text on top.
// size = where it is shown (lib/photo.js PHOTO_SIZES: thumb | tile | card | hero): srcset + sizes pick a small
// Commons thumbnail for small slots. priority = the largest paint of the screen (loads first, not lazy); in a list or
// row it also skips the fade-in (.ph-now), so it shows as soon as it is decoded. Detail heroes keep the fade.
// Other photos get their src only when they are about 300 px from the visible area (one shared IntersectionObserver),
// plus loading="lazy": the browser's own lazy loading starts every photo within 1250–2500 px at once, and on a
// slow connection those compete with the photo people actually look at.
// crossOrigin: Commons sends CORS headers, so the service worker can cache the photos (sw.js).
const SHADE = 'linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,0) 60%), ';
const loaded = new Set();   // photos already loaded in this session show at once (no fade again)

const waiting = new Map();   // element → callback, for the shared observer
let io = null;
function whenNear(el, cb) {
  if (typeof IntersectionObserver !== 'function') { cb(); return () => {}; }
  io = io || new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const f = waiting.get(e.target); waiting.delete(e.target); io.unobserve(e.target); if (f) f();
  }), {rootMargin: '300px'});
  waiting.set(el, cb); io.observe(el);
  return () => { waiting.delete(el); io.unobserve(el); };
}

export function Photo({ p, shade, size = 'card', priority, as: Tag = 'div', className = '', style, children, ...rest }) {
  const img = photoAttrs(p.img, size), box = useRef(null);
  const [st, setSt] = useState(() => !img ? 'none' : loaded.has(p.img) ? 'loaded' : 'loading');
  const [near, setNear] = useState(() => !!priority || loaded.has(p.img));
  useEffect(() => { if (!near && img && box.current) return whenNear(box.current, () => setNear(true)); }, [near, p.img]);
  const done = ok => { if (ok) loaded.add(p.img); setSt(ok ? 'loaded' : 'failed'); };
  return (
    <Tag ref={box} className={`${className} photo ph-${st}${shade ? ' ph-shade' : ''}${priority && size !== 'hero' ? ' ph-now' : ''}`} style={{...style, background: (shade ? SHADE : '') + p.g}} {...rest}>
      {img && near && <img className="ph-img" alt="" aria-hidden="true" draggable="false" crossOrigin="anonymous" decoding="async" {...img}
                   loading={priority ? 'eager' : 'lazy'} fetchpriority={priority ? 'high' : undefined}
                   onLoad={() => done(true)} onError={() => done(false)} />}
      {children}
    </Tag>
  );
}
