// Service worker Maimon: cache app shell supaya bisa main offline.
const V = 'maimon-v11';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'vendor/three.module.js', 'vendor/addons/utils/BufferGeometryUtils.js', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) { // shell: coba jaringan dulu untuk HTML, cache untuk sisanya
    if (r.mode === 'navigate') { e.respondWith(fetch(r).then((x) => { const c = x.clone(); caches.open(V).then((ch) => ch.put('index.html', c)); return x; }).catch(() => caches.match('index.html'))); return; }
    e.respondWith(caches.match(r).then((m) => m || fetch(r).then((x) => { const c = x.clone(); caches.open(V).then((ch) => ch.put(r, c)); return x; })));
  } else if (/fonts\.(googleapis|gstatic)\.com/.test(u.host)) { // font: stale-while-revalidate
    e.respondWith(caches.open(V).then((ch) => ch.match(r).then((m) => { const f = fetch(r).then((x) => { ch.put(r, x.clone()); return x; }).catch(() => m); return m || f; })));
  }
});
