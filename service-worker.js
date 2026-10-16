const CACHE_NAME = "tour-catholico-kat-shell-v6";
const APP_FILES = [
  "./?v=6",
  "./index.html?v=6",
  "./travel.css?v=6",
  "./travel.js?v=6",
  "./trip-config.js?v=6",
  "./trip-sync.js?v=6",
  "./manifest.webmanifest?v=6",
  "./San Marino.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin || event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    const currentIndex = new URL("./index.html?v=6", self.location.href);
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) =>
        (await cache.match(currentIndex)) || fetch(event.request)
      )
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => (await caches.match(event.request)) || Response.error())
  );
});
