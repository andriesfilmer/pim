self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  // Perform install steps
  event.waitUntil(
    caches.open('my-cache').then(cache => {
      console.log('Opened cache');
      return cache.addAll([
        '/',
        // add other assets you want to cache
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

