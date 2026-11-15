// Service worker: makes the app installable and lets it open offline.
// - App shell (same origin): network-first, so a new deploy shows up right away; the cache is the offline fallback.
//   Precached on install: CORE + the hashed build files (JS, CSS, own images) that `npm run build` lists in BUILD.
// - Place photos (Wikimedia Commons): cache-first, at most 80 photos, each kept 14 days.
// - Map tiles (OpenStreetMap): stale-while-revalidate, at most 300 tiles.
// Everything else (weather API …) goes straight to the network.
// ee-v3 = precache list generated from the files that really exist in dist/ (ee-v2 listed a missing file, so its
// install failed on Vercel). Activating deletes every older cache ('ee-v1', 'ee-v2').
const CACHE = 'ee-v3', PHOTOS = 'ee-photos', TILES = 'ee-tiles';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'assets/icon-192.png'];
// Filled in by `npm run build` (vite.config.js) with the hashed files of this build.
const BUILD = /* BUILD_FILES */[];
const KEEP = new Set([...CORE, ...BUILD].map(f => new URL(f, self.registration.scope).href));
const PHOTO_MAX = 80, PHOTO_DAYS = 14, TILE_MAX = 300;
const isPhoto = u => /^(thumb|upload)\.wikimedia\.org$/.test(u.hostname);
const isTile = u => /(^|\.)tile\.openstreetmap\.org$/.test(u.hostname);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([...CORE, ...BUILD])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => ![CACHE, PHOTOS, TILES].includes(k)).map(k => caches.delete(k))))
      // hashed files from older builds are never requested again: remove them from the app cache
      .then(() => caches.open(CACHE))
      .then(c => c.keys().then(reqs => Promise.all(reqs.filter(r => !KEEP.has(r.url)).map(r => c.delete(r)))))
      .then(() => self.clients.claim())
  );
});

// Keeps at most `max` entries (the oldest go first)
const trim = (name, max) => caches.open(name).then(c => c.keys().then(k => Promise.all(k.slice(0, Math.max(0, k.length - max)).map(r => c.delete(r)))));
// Only real (CORS) answers are cached: opaque ones can't be checked and take a lot of storage
const cacheable = res => res && res.ok && (res.type === 'cors' || res.type === 'basic');

// Photos: from the cache while younger than 14 days; otherwise the network (an old copy is still better than nothing offline)
async function photo(req) {
  const c = await caches.open(PHOTOS), hit = await c.match(req);
  const age = hit ? Date.now() - Number(hit.headers.get('sw-cached') || 0) : Infinity;
  if (hit && age < PHOTO_DAYS * 864e5) return hit;
  try {
    const res = await fetch(req);
    if (cacheable(res)) {
      const h = new Headers(res.headers); h.set('sw-cached', String(Date.now()));
      const copy = new Response(await res.clone().blob(), {status: res.status, statusText: res.statusText, headers: h});
      await c.put(req, copy); trim(PHOTOS, PHOTO_MAX);
    }
    return res;
  } catch (err) {
    if (hit) return hit;
    throw err;
  }
}
// Tiles: the cached tile at once, refreshed in the background for next time
async function tile(req, e) {
  const c = await caches.open(TILES), hit = await c.match(req);
  const update = fetch(req).then(res => {
    if (cacheable(res)) return c.put(req, res.clone()).then(() => trim(TILES, TILE_MAX)).then(() => res);
    return res;
  });
  if (hit) { e.waitUntil(update.catch(() => {})); return hit; }
  return update;
}

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (isPhoto(url)) return e.respondWith(photo(req));
  if (isTile(url)) return e.respondWith(tile(req, e));
  if (url.origin !== location.origin) return;   // weather API and other cross-origin requests: straight to the network
  // ignoreVary: files cached on install must also match module/CORS requests (servers may send "Vary: Origin")
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, {ignoreVary: true}).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html', {ignoreVary: true}) : undefined)))
  );
});
