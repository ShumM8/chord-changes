const CACHE = "chord-changes-v2";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isFont = /^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !isFont) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const key = e.request.mode === "navigate" ? "./" : e.request;
    const hit = await c.match(key);
    const net = fetch(e.request).then(r => { if (r.ok || r.type === "opaque") c.put(key, r.clone()); return r; });
    if (hit) { net.catch(() => {}); return hit; }  /* show the cached copy now, refresh it for next launch */
    return net;
  }));
});
