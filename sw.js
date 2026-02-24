// ── AOF Finder v6 — Service Worker BUILD 037 ──
// Change version number = forces ALL devices to reload fresh!
const CACHE = 'aof-v6-cache-v37';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// INSTALL — cache all assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(ASSETS);
    })
  );
  // Force activate immediately — dont wait for old SW to die
  self.skipWaiting();
});

// ACTIVATE — delete ALL old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) {
              console.log('Deleting old cache:', k);
              return caches.delete(k);
            })
      );
    }).then(function() {
      // Take control of all open pages immediately
      return self.clients.claim();
    })
  );
});

// FETCH — network first, cache fallback
self.addEventListener('fetch', function(e) {
  // Never cache Google Script calls
  if (e.request.url.indexOf('script.google.com') > -1) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(function(r) {
        // Cache fresh response
        var clone = r.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return r;
      })
      .catch(function() {
        // Offline — use cache
        return caches.match(e.request);
      })
  );
});
