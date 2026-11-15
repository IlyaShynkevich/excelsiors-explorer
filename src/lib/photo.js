// ---------- Place / hotel photos: Wikimedia Commons thumbnails sized for where they are shown ----------
// Commons only renders its standard thumbnail widths (others answer 400): 120, 250, 330, 500, 960, 1280.
// PHOTOS / HOTELS keep their 960 px URL (or the original upload URL); thumbUrl() turns either into another width.
export const THUMB_WIDTHS = [120, 250, 330, 500, 960, 1280];

// Photo sizes by role. srcset only offers widths up to `max`, so small slots never download the big file;
// `sizes` is the shown CSS width (measured at 320–480 px). Cards stop at 500 px (about 1.4x on a 358 px card).
export const PHOTO_SIZES = {
  thumb: {widths: [250, 330], sizes: '96px'},                                   // 56–96 px rows, map card, arrival sheet
  tile:  {widths: [250, 330], sizes: '(max-width: 480px) 40vw, 192px'},          // Home / Profile tiles, Saved grid (122–173 px)
  card:  {widths: [330, 500], sizes: '(max-width: 480px) calc(100vw - 32px), 448px'},   // Explore / Meetups / hotel list cards
  hero:  {widths: [500, 960], sizes: '(max-width: 480px) 100vw, 480px'},         // place / meetup / hotel hero
};

// .../commons/thumb/a/ab/Name.jpg/960px-Name.jpg  or  .../commons/a/ab/Name.jpg  →  the same photo w px wide
const THUMB = /^https:\/\/(?:thumb|upload)\.wikimedia\.org\/wikipedia\/commons\/thumb\/(\w\/\w\w)\/([^/]+)\/\d+px-[^/]+$/;
const ORIGINAL = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(\w\/\w\w)\/([^/]+)$/;
export function thumbUrl(url, w) {
  const m = url && (url.match(THUMB) || url.match(ORIGINAL));
  return m ? `https://thumb.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${w}px-${m[2]}` : url;
}

// {src, srcSet, sizes} for an <img> of photo url in role `size` (see PHOTO_SIZES)
export function photoAttrs(url, size = 'card') {
  const s = PHOTO_SIZES[size] || PHOTO_SIZES.card, w = s.widths;
  if (!url) return null;
  if (thumbUrl(url, w[0]) === url) return {src: url};   // not a Commons URL: as it is
  return {src: thumbUrl(url, w[w.length - 1]), srcSet: w.map(x => `${thumbUrl(url, x)} ${x}w`).join(', '), sizes: s.sizes};
}
