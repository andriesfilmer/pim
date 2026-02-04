// Simple IndexedDB helper for offline data storage
const DB_NAME = 'pim-offline';
const DB_VERSION = 1;

const OfflineDB = {
  db: null,

  async open() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create stores for each model
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('contacts')) {
          db.createObjectStore('contacts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('posts')) {
          db.createObjectStore('posts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('passkeys')) {
          db.createObjectStore('passkeys', { keyPath: 'id' });
        }
      };
    });
  },

  async saveAll(storeName, items) {
    const db = await this.open();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // Clear existing and add new
    store.clear();
    items.forEach(item => store.put(item));

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async save(storeName, item) {
    const db = await this.open();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(item);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async delete(storeName, id) {
    const db = await this.open();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(id);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getAll(storeName) {
    const db = await this.open();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async get(storeName, id) {
    const db = await this.open();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(Number(id));

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async clearAllData() {
    try {
      const db = await this.open();
      const stores = ['events', 'contacts', 'posts', 'passkeys'];

      for (const storeName of stores) {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
        await new Promise((resolve, reject) => {
          tx.oncomplete = resolve;
          tx.onerror = reject;
        });
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  async deleteDatabase() {
    await this.clearAllData();

    if (this.db) {
      this.db.close();
      this.db = null;
    }

    return new Promise((resolve) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
      request.onblocked = () => resolve(true);
    });
  },

  async syncFromServer() {
    try {
      const [events, contacts, posts, passkeys] = await Promise.all([
        fetch('/events.json').then(r => r.ok ? r.json() : []),
        fetch('/contacts.json').then(r => r.ok ? r.json() : []),
        fetch('/posts.json').then(r => r.ok ? r.json() : []),
        fetch('/passkeys.json').then(r => r.ok ? r.json() : [])
      ]);

      await Promise.all([
        this.saveAll('events', events),
        this.saveAll('contacts', contacts),
        this.saveAll('posts', posts),
        this.saveAll('passkeys', passkeys)
      ]);

      return true;
    } catch (error) {
      return false;
    }
  }
};

// Export for use in service worker and main app
if (typeof window !== 'undefined') {
  window.OfflineDB = OfflineDB;
}
