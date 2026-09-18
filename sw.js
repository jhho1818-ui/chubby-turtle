/* ==================================================================
   © כל הזכויות שמורות | ALL RIGHTS RESERVED
   צאבי הצב — שומר צבי הים
   יוצר ובעלים בלעדי: דניאל אברהם חדאד | Creator & sole owner: Daniel Avraham Haddad
   🔒 [CBY-PROOF] טביעת אצבע: CBY-T7R4L2E9 · מזהה יוצר: DAH-CBY-2026
   Unauthorized copying, distribution or attribution is prohibited.
   ================================================================== */
/* צאבי — Service Worker | CBY-T7R4L2E9 */
var CACHE = 'chubby-v19';
var ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './kb.js',
  './lexicon.js',
  './smart.js',
  './mind.js',
  './match.js',
  './talk.js',
  './games.js',
  './games3d.js',
  './sound.js',
  './voice.js',
  './care.js',
  './academy.js',
  './articles.js',
  './cby-owner.js',
  './academy-deep.js',
  './chubby3d.js',
  './three.min.js',
  './brain.json',
  './brain.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon-32.png'
];
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

/* brain.json והדף עצמו — רשת קודם, כדי שמאגר ידע מעודכן יגיע מיד */
function networkFirst(request) {
  return fetch(request).then(function (res) {
    if (res && res.ok) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(request, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(request);
  });
}
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var url = e.request.url;
  if (e.request.mode === 'navigate' || url.indexOf('brain.json') !== -1) {
    e.respondWith(networkFirst(e.request));
    return;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var fetched = fetch(e.request).then(function (res) {
        if (res && res.ok && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || fetched;
    })
  );
});
