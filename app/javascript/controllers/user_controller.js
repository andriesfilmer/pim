// user_controller.js
import { Controller } from "@hotwired/stimulus";
import { tooltip } from 'components';

export default class extends Controller {
  static values = { offlineData: Boolean }

  connect() {
    tooltip();

    // Set switch in profile to system, light or dark theme.
    // Theme switches only exist on the home page; this controller is also
    // used on the registrations edit page (offline data switch).
    const light = document.getElementById("theme_light");
    const dark = document.getElementById("theme_dark");
    if (!light || !dark) return;

    if (localStorage.getItem("theme") === "dark-theme") {
      dark.checked = true;
    } else {
      // Default light theme.
      light.checked = true;
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
