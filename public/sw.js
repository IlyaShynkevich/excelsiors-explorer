// Minimal service worker: makes the app installable and lets it open offline.
// Everything is fetched network-first, so a new deploy shows up right away; the cache is only the offline fallback.
// ee-v2 = the React/Vite build. Activating it deletes the old 'ee-v1' cache of the single-file app.
const CACHE = 'ee-v2';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'assets/favicon.png', 'assets/apple-touch-icon.png', 'assets/icon-192.png',
              'assets/icon-512.png', 'assets/icon-maskable-512.png'];
// Filled in by `npm run build` (vite.config.js) with the hashed JS, CSS and image files of this build.
const BUILD = /* BUILD_FILES */[];
const KEEP = new Set([...CORE, ...BUILD].map(f => new URL(f, self.registration.scope).href));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([...CORE, ...BUILD])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      // hashed files from older builds are never requested again: remove them from ee-v2
      .then(() => caches.open(CACHE))
      .then(c => c.keys().then(reqs => Promise.all(reqs.filter(r => !KEEP.has(r.url)).map(r => c.delete(r)))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;   // photos from Wikimedia go straight to the network
  // ignoreVary: files cached on install must also match module/CORS requests (servers may send "Vary: Origin")
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, {ignoreVary: true}).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html', {ignoreVary: true}) : undefined)))
  );
});
