// user_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = { offlineData: Boolean }

  connect() {
    // Set switch in profile to system, light or dark theme.
    if (localStorage.getItem("theme") === "light-theme") {
      document.getElementById("theme_light").checked = true;
    } else if (localStorage.getItem("theme") === "dark-theme") {
      document.getElementById("theme_dark").checked = true;
    } else {
      // Default light theme.
      document.getElementById("theme_light").checked = true;
    }
  }

  setTheme() {
    document.body.className = "";
    if (document.getElementById("theme_light").checked) {
      localStorage.removeItem("theme-sys");
      localStorage.setItem("theme", "light-theme");
      document.body.classList.add("light-theme");
    } else if (document.getElementById("theme_dark").checked) {
      localStorage.removeItem("theme-sys");
      localStorage.setItem("theme", "dark-theme");
      document.body.classList.add("dark-theme");
    }
  }

  async setOfflineData(event) {
    const checkbox = event.target;
    const enabled = checkbox.checked;
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

    try {
      const response = await fetch('/offline_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRF-Token': csrfToken
        },
        body: `offline_data=${enabled}`
      });

      if (response.ok) {
        if (enabled) {
          if (typeof window.OfflineDB === 'undefined') {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = '/offline-db.js?v=2';
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }
          window.OfflineDB.syncFromServer();
        } else {
          // Close all open connections before deleting the database
          if (window.OfflineDB?.db) {
            window.OfflineDB.db.close();
            window.OfflineDB.db = null;
          }
          if (navigator.serviceWorker?.controller) {
            navigator.serviceWorker.controller.postMessage('close-indexeddb');
          }
          setTimeout(() => {
            const request = indexedDB.deleteDatabase('pim-offline');
            request.onsuccess = () => window.location.reload();
            request.onerror = () => window.location.reload();
            request.onblocked = () => window.location.reload();
          }, 100);
        }
      }
    } catch (error) {
      checkbox.checked = !enabled;
    }
  }
}
