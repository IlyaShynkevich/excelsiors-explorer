import { useEffect, useState } from 'react';

// Place photo (Wikimedia Commons) as a CSS background that fades in once it has loaded, with a soft
// shimmer until then (styles/motion.css). The colour gradient p.g stays underneath: that is also what you
// see offline or when a photo fails. shade = dark gradient at the bottom for white text on top.
const SHADE = 'linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,0) 60%), ';
const loaded = new Set();   // photos already loaded in this session show at once (no fade again)

function usePhotoState(url) {
  const [st, setSt] = useState(() => !url ? 'none' : loaded.has(url) ? 'loaded' : 'loading');
  useEffect(() => {
    if (!url || loaded.has(url)) return;
    let live = true;
    const img = new Image();
    img.onload = () => { loaded.add(url); if (live) setSt('loaded'); };
    img.onerror = () => { if (live) setSt('failed'); };
    img.src = url;
    return () => { live = false; };
  }, [url]);
  return st;
}

export function Photo({ p, shade, as: Tag = 'div', className = '', style, children, ...rest }) {
  const st = usePhotoState(p.img), sh = shade ? SHADE : '';
  const css = {...style, background: sh + p.g, '--photo': p.img ? `${sh}url('${p.img}') center/cover no-repeat` : 'none'};
  return <Tag className={`${className} photo ph-${st}`} style={css} {...rest}>{children}</Tag>;
}
