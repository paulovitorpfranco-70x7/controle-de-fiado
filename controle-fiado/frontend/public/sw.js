const STATIC_CACHE = "controle-fiado-static-v1";
const RUNTIME_CACHE = "controle-fiado-runtime-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/assets/logo-mercadinho-tonhao-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key)).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/index.html")))
    );
    return;
  }

  const isAssetRequest = /\.(?:js|css|png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname);

  if (!isAssetRequest) {
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
    )
  );
});
