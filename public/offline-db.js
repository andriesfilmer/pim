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

  // Refresh a single store from the server. For passkeys the server returns
  // only the offline-flagged subset, so saveAll (clear + repopulate) also
  // removes any that were unflagged or deleted.
  async syncStore(storeName) {
    try {
      const res = await fetch(`/${storeName}.json`);
      if (!res.ok) return false;
      const items = await res.json();
      await this.saveAll(storeName, items);
      return true;
    } catch (error) {
      return false;
    }
  },

  async syncFromServer() {
    const stores = ['events', 'contacts', 'posts', 'passkeys'];
    const results = await Promise.all(stores.map(s => this.syncStore(s)));
    return results.every(Boolean);
  }
};

// Export for use in service worker and main app
if (typeof window !== 'undefined') {
  window.OfflineDB = OfflineDB;
}
