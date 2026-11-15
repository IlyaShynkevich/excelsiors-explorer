import { useState } from 'react';
import { photoAttrs } from '../lib/photo.js';

// Place / hotel photo (Wikimedia Commons). The colour gradient p.g is the element's own background (also what you
// see offline or when a photo fails); the photo is an <img> behind the content (styles/motion.css) that fades in
// once loaded, with a soft shimmer until then. shade = dark gradient at the bottom for white text on top.
// size = where it is shown (lib/photo.js PHOTO_SIZES: thumb | tile | card | hero): srcset + sizes pick a small
// Commons thumbnail for small slots. priority = the largest paint of the screen (loads first, not lazy).
// crossOrigin: Commons sends CORS headers, so the service worker can cache the photos (sw.js).
const SHADE = 'linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,0) 60%), ';
const loaded = new Set();   // photos already loaded in this session show at once (no fade again)

export function Photo({ p, shade, size = 'card', priority, as: Tag = 'div', className = '', style, children, ...rest }) {
  const img = photoAttrs(p.img, size);
  const [st, setSt] = useState(() => !img ? 'none' : loaded.has(p.img) ? 'loaded' : 'loading');
  const done = ok => { if (ok) loaded.add(p.img); setSt(ok ? 'loaded' : 'failed'); };
  return (
    <Tag className={`${className} photo ph-${st}${shade ? ' ph-shade' : ''}`} style={{...style, background: (shade ? SHADE : '') + p.g}} {...rest}>
      {img && <img className="ph-img" alt="" aria-hidden="true" draggable="false" crossOrigin="anonymous" decoding="async" {...img}
                   loading={priority ? 'eager' : 'lazy'} fetchpriority={priority ? 'high' : undefined}
                   onLoad={() => done(true)} onError={() => done(false)} />}
      {children}
    </Tag>
  );
}
