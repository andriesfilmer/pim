const CACHE_NAME = 'pim-cache-v6';
const OFFLINE_URL = '/offline.html';
const DB_NAME = 'pim-offline';

// IndexedDB helper for service worker
const OfflineDB = {
  db: null,

  async open() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
    });
  },

  async getAll(storeName) {
    try {
      const db = await this.open();
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return [];
    }
  },

  async get(storeName, id) {
    try {
      const db = await this.open();
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(Number(id));

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return null;
    }
  }
};

// Close IndexedDB connection when asked (needed for deleteDatabase to succeed)
self.addEventListener('message', (event) => {
  if (event.data === 'close-indexeddb') {
    if (OfflineDB.db) {
      OfflineDB.db.close();
      OfflineDB.db = null;
    }
  }
});

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        OFFLINE_URL,
        '/offline-db.js'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Generate offline HTML pages
function generateOfflineHTML(title, content) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Pim - ${title} (Offline)</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; background: #f5f5f5; color: #333; min-height: 100vh; }
    .nav { background: #7359a6; padding: 0.5rem; color: #fff; }
    .nav a { color: #fff; margin-right: 0.5rem; text-decoration: none; }
    .nav a:hover { text-decoration: underline; }
    .content { padding: 1rem; }
    h1 { margin-bottom: 1rem; font-size: 1.5rem; }
    ul { list-style: none; }
    li { padding: 0.5rem 0; border-bottom: 1px solid #ddd; }
    li a { color: #7359a6; text-decoration: none; }
    li a:hover { text-decoration: underline; }
    pre { background: #fff; padding: 1rem; border: 1px solid #ddd; white-space: pre-wrap; word-wrap: break-word; font-size: 0.875rem; }
    .offline-badge { background: #e74c3c; color: #fff; padding: 0.2rem 0.5rem; border-radius: 3px; font-size: 0.75rem; margin-right: 0.5rem; }
  </style>
</head>
<body>
  <nav class="nav">
    <span class="offline-badge">OFFLINE</span>
    <a href="/events">Events</a>
    <a href="/contacts">Contacts</a>
    <a href="/posts">Posts</a>
    <a href="/passkeys">Passkeys</a>
  </nav>
  <div class="content">
    ${content}
  </div>
</body>
</html>`;
}

// Parse URL to get route info
function parseRoute(url) {
  const path = new URL(url).pathname;
  const match = path.match(/^\/(events|contacts|posts|passkeys)(?:\/(\d+))?$/);
  if (match) {
    return { store: match[1], id: match[2] || null };
  }
  return null;
}

// Format date for display
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

// Generate index list HTML
async function generateIndexPage(store) {
  let items = await OfflineDB.getAll(store);

  // Filter and sort based on store type
  if (store === 'events') {
    // Show events from one month ago to two months ahead
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const twoMonthsAhead = new Date();
    twoMonthsAhead.setMonth(twoMonthsAhead.getMonth() + 2);
    items = items
      .filter(e => {
        const start = new Date(e.start);
        return start >= oneMonthAgo && start <= twoMonthsAhead;
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  } else {
    // contacts, posts, passkeys: order by last_read
    items = items.sort((a, b) => {
      const aDate = new Date(a.last_read || 0);
      const bDate = new Date(b.last_read || 0);
      return bDate - aDate;
    });
  }

  const title = store.charAt(0).toUpperCase() + store.slice(1);

  if (items.length === 0) {
    return generateOfflineHTML(title, `<h1>${title}</h1><p>No offline data available.</p>`);
  }

  let listHtml = `<h1>${title}</h1><ul>`;
  for (const item of items) {
    const displayTitle = item.title || item.name || `#${item.id}`;
    const extra = store === 'events' && item.start ? ` (${formatDate(item.start)})` : '';
    listHtml += `<li><a href="/${store}/${item.id}">${displayTitle}${extra}</a></li>`;
  }
  listHtml += '</ul>';

  return generateOfflineHTML(title, listHtml);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Generate show page HTML
async function generateShowPage(store, id) {
  const item = await OfflineDB.get(store, id);

  if (!item) {
    return generateOfflineHTML('Not Found', '<h1>Not Found</h1><p>Item not available offline.</p>');
  }

  const title = item.title || item.name || `#${item.id}`;
  let details = '';

  if (store === 'events') {
    details = `
      <p><strong>Start:</strong> ${formatDate(item.start)}</p>
      <p><strong>End:</strong> ${formatDate(item.end)}</p>
      ${item.tags ? `<p><strong>Tags:</strong> ${escapeHtml(item.tags)}</p>` : ''}
      ${item.description ? `<h3>Description</h3><pre>${escapeHtml(item.description)}</pre>` : ''}
    `;
  } else if (store === 'contacts') {
    details = `
      ${item.emails ? `<p><strong>Emails:</strong> ${escapeHtml(item.emails)}</p>` : ''}
      ${item.phones ? `<p><strong>Phones:</strong> ${escapeHtml(item.phones)}</p>` : ''}
      ${item.birthdate ? `<p><strong>Birthdate:</strong> ${item.birthdate}</p>` : ''}
      ${item.tags ? `<p><strong>Tags:</strong> ${escapeHtml(item.tags)}</p>` : ''}
      ${item.notes ? `<h3>Notes</h3><pre>${escapeHtml(item.notes)}</pre>` : ''}
    `;
  } else if (store === 'posts') {
    details = `
      ${item.tags ? `<p><strong>Tags:</strong> ${escapeHtml(item.tags)}</p>` : ''}
      ${item.content ? `<h3>Content</h3><pre>${escapeHtml(item.content)}</pre>` : ''}
    `;
  } else if (store === 'passkeys') {
    details = `
      ${item.url ? `<p><strong>URL:</strong> ${escapeHtml(item.url)}</p>` : ''}
      ${item.username ? `<p><strong>Username:</strong> ${escapeHtml(item.username)}</p>` : ''}
      ${item.password ? `<p><strong>Password:</strong> ${escapeHtml(item.password)}</p>` : ''}
      ${item.tags ? `<p><strong>Tags:</strong> ${escapeHtml(item.tags)}</p>` : ''}
      ${item.notes ? `<h3>Notes</h3><pre>${escapeHtml(item.notes)}</pre>` : ''}
    `;
  }

  const content = `
    <h1>${escapeHtml(title)}</h1>
    ${details}
  `;

  return generateOfflineHTML(title, content);
}

self.addEventListener('fetch', event => {
  const route = parseRoute(event.request.url);

  if (event.request.mode === 'navigate' || event.request.headers.get('Accept')?.includes('text/html')) {
    // Network-first for all page requests (including Turbo Drive fetches)
    event.respondWith(
      fetch(event.request)
        .catch(async () => {
          // Offline - check if we can serve from IndexedDB
          if (route) {
            let html;
            if (route.id) {
              html = await generateShowPage(route.store, route.id);
            } else {
              html = await generateIndexPage(route.store);
            }
            return new Response(html, {
              headers: { 'Content-Type': 'text/html' }
            });
          }
          // Fallback to offline page
          return caches.match(OFFLINE_URL);
        })
    );
  } else {
    // Network-first for all other requests (JS, CSS, images, API calls)
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});
