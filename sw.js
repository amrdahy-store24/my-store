// Tekmoo service worker — شبكة أولاً، والكاش بس لما النت يقطع
const C = 'tekmoo-v1';
const SHELL = ['/', '/index.html', '/style.css', '/app.js', '/i18n.js', '/categories.js', '/favicon.svg', '/icon-192.png', '/icon-512.png', '/manifest.webmanifest'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/img/') || u.pathname === '/healthz') return;
  e.respondWith(
    fetch(r).then(res => {
      if (res && res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match('/index.html') || caches.match('/')))
  );
});
