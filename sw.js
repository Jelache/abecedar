// Păstrează aplicația pe dispozitiv ca să meargă fără internet,
// dar ia mereu versiunea nouă când există internet.
const CACHE = "abecedar-v3";
const FILES = ["./", "index.html", "audio.json", "manifest.webmanifest", "privacy.html", "icons/icon-192.png", "icons/icon-512.png",
  ...["img/1f0cf.webp", "img/1f319.webp", "img/1f330.webp", "img/1f338.webp", "img/1f33f.webp", "img/1f346.webp", "img/1f347.webp", "img/1f34a.webp", "img/1f34b.webp", "img/1f34c.webp", "img/1f34d.webp", "img/1f34e.webp", "img/1f350.webp", "img/1f353.webp", "img/1f35e.webp", "img/1f366.webp", "img/1f369.webp", "img/1f36a.webp", "img/1f36b.webp", "img/1f383.webp", "img/1f388.webp", "img/1f3a8.webp", "img/1f3b2.webp", "img/1f3b6.webp", "img/1f3bb.webp", "img/1f3c4.webp", "img/1f3e0.webp", "img/1f406.webp", "img/1f408-200d-2b1b.webp", "img/1f40d.webp", "img/1f411.webp", "img/1f412.webp", "img/1f414.webp", "img/1f418.webp", "img/1f41d.webp", "img/1f41e.webp", "img/1f41f.webp", "img/1f422.webp", "img/1f425.webp", "img/1f427.webp", "img/1f428.webp", "img/1f42c.webp", "img/1f42d.webp", "img/1f42f.webp", "img/1f430.webp", "img/1f431.webp", "img/1f433.webp", "img/1f434.webp", "img/1f436.webp", "img/1f437.webp", "img/1f438.webp", "img/1f439.webp", "img/1f43b.webp", "img/1f440.webp", "img/1f442.webp", "img/1f443.webp", "img/1f451.webp", "img/1f47c.webp", "img/1f4a7.webp", "img/1f4d6.webp", "img/1f4f1.webp", "img/1f521.webp", "img/1f522.webp", "img/1f524.webp", "img/1f525.webp", "img/1f577-fe0f.webp", "img/1f5a5-fe0f.webp", "img/1f5fa-fe0f.webp", "img/1f680.webp", "img/1f681.webp", "img/1f682.webp", "img/1f692.webp", "img/1f695.webp", "img/1f697.webp", "img/1f6a2.webp", "img/1f6de.webp", "img/1f916.webp", "img/1f94b.webp", "img/1f952.webp", "img/1f955.webp", "img/1f95a.webp", "img/1f95d.webp", "img/1f966.webp", "img/1f981.webp", "img/1f984.webp", "img/1f986.webp", "img/1f989.webp", "img/1f98a.webp", "img/1f98b.webp", "img/1f992.webp", "img/1f993.webp", "img/1f995.webp", "img/1f99b.webp", "img/1f99f.webp", "img/1f9a9.webp", "img/1f9d8.webp", "img/1f9e6.webp", "img/1f9f8.webp", "img/1f9fa.webp", "img/1fa80.webp", "img/1fa81.webp", "img/1fa88.webp", "img/1fad0.webp", "img/23f0.webp", "img/2600-fe0f.webp", "img/2601-fe0f.webp", "img/2602-fe0f.webp", "img/26c4.webp", "img/26f5.webp", "img/2708-fe0f.webp", "img/270b.webp", "img/270f-fe0f.webp", "img/2744-fe0f.webp", "img/2753.webp", "img/2764-fe0f.webp", "img/2b50.webp"]];

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
