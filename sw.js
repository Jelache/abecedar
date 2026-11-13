// Păstrează aplicația pe dispozitiv ca să meargă fără internet,
// dar ia mereu versiunea nouă când există internet.
const CACHE = "abecedar-v2";
const FILES = ["./", "index.html", "audio.json", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: "reload"})))).then(() => self.skipWaiting())));

self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));

const save = (req, res) => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; };

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const own = url.origin === self.location.origin;
  // Pagina și sunetele: întâi de pe internet (versiunea nouă), altfel din memoria tabletei.
  if (own && (req.mode === "navigate" || /\.(html|json|webmanifest)$/.test(url.pathname) || url.pathname.endsWith("/"))) {
    e.respondWith(fetch(req, {cache: "no-cache"}).then(r => save(req, r))
      .catch(() => caches.match(req).then(hit => hit || caches.match("index.html"))));
    return;
  }
  // Iconițe și fonturi: din memorie, actualizate în fundal.
  if (own || url.hostname.startsWith("fonts.g")) {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(r => save(req, r)).catch(() => hit);
      return hit || net;
    }));
  }
});
