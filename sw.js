const V = 'beresin-v32';
const FILES = ['./', 'index.html', 'app.css', 'manifest.json', 'js/core.js?v=32', 'js/ui.js?v=32', 'js/v_beranda.js?v=32', 'js/v_booking.js?v=32', 'js/v_klien.js?v=32', 'js/v_uang.js?v=32', 'js/v_publik.js?v=32', 'js/v_lain.js?v=32', 'js/poster.js?v=32', 'js/lisensi.js?v=32', 'js/sinkron.js?v=32', 'js/rekap.js?v=32', 'js/tautan.js?v=32', 'js/app.js?v=32', 'img/icon.svg', 'img/ikon-192.png', 'img/ikon-512.png', 'fonts/OpenSauceOne-ExtraBold.ttf', 'fonts/OpenSauceOne-Bold.ttf', 'fonts/Inter-Regular.ttf', 'fonts/Inter-SemiBold.ttf', 'fonts/Inter-Bold.ttf'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
