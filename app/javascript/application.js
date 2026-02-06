// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails

import "@hotwired/turbo-rails";
import "@hotwired/stimulus";
import $ from "jquery";
window.$ = window.jQuery = $;
import "controllers";
//import "components"
//
//Turbo.session.drive = false

Turbo.config.forms.confirm = async (message) => {
  //console.log(message)
  let dialog = document.getElementById("turbo-confirm");
  dialog.showModal();
  dialog.querySelector("p").textContent = message;

  return new Promise((resolve) => {
    dialog.addEventListener(
      "close",
      () => {
        resolve(dialog.returnValue == "confirm");
      },
      { once: true },
    );
  });
};

document.addEventListener("turbo:load", loadFunction);
document.addEventListener("turbo:frame-load", loadFunction); // If you're using Turbo Frames
document.addEventListener("turbo:submit-end", (event) => {
  if (!event.detail.success) {
    loadFunction();
  }
});

function loadFunction() {
  // Set light-theme as default if theme not set.
  if (localStorage.getItem("theme") === null) {
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.add(localStorage.getItem("theme"));
  }

  // Add back arrow functionality
  const elArrow = document.getElementById("add-back-arrow");
  if (elArrow != null) {
    const span = document.createElement("span");
    span.className = "back-arrow show-for-small-only";
    elArrow.prepend(span);
    elArrow.addEventListener("click", () => {
      window.history.back();
    });
  }

  // Hide flash messages
  $("#flash, #dialog_flash").on("click",function (event) {
    $(event.target).closest(".flash").hide("slow");
  });

  // Clear search box
  const searchEl = document.getElementById("search");
  if (searchEl) {
    searchEl.addEventListener("input", (e) => {
      //console.log(`Search value: "${e.currentTarget.value}"`);
      if (e.currentTarget.value === "") {
        document.cookie = "search=";
      }
    });
  }
}

// Begin Service Worker code
// -------------------------
// 1 Register the service worker to manage caching and offline functionality (/service-worker.js)
// 2 Handle the beforeinstallprompt event to prompt the user to install the PWA.
// 3 Create UI elements to trigger the install prompt.
//
// This setup ensures that your PWA will prompt users for installation when the conditions are met.

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}

//  Prompt for Installation
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;

  // Update UI notify the user they can install the PWA
  if (document.getElementById("installButton")) {
    showInstallButton();
  }
});

function showInstallButton() {
  const installButton = document.getElementById("installButton");
  installButton.classList.remove("display-none");

  installButton.addEventListener("click", () => {
    installButton.classList.add("display-none");
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
    });
  });
}

// End Service Worker code
// -----------------------

// Offline Data Sync
// -----------------
// Check if offline data is enabled for the user
function isOfflineDataEnabled() {
  const meta = document.querySelector('meta[name="offline-data"]');
  return meta && meta.content === 'true';
}

// Load offline-db.js and sync data when online
async function initOfflineSync() {
  // Check if user has offline data enabled
  if (!isOfflineDataEnabled()) {
    return;
  }

  // Load the OfflineDB script if not already loaded
  if (typeof window.OfflineDB === 'undefined') {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/offline-db.js?v=2';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Sync data from server to IndexedDB
  if (navigator.onLine) {
    window.OfflineDB.syncFromServer();
  }
}

// Run sync on page load
document.addEventListener('turbo:load', () => {
  // Only sync if we're on an authenticated page (has nav menu)
  if (document.querySelector('nav.color-bg-500')) {
    initOfflineSync();
  }
});

// Listen for online event to sync when connection is restored
window.addEventListener('online', () => {
  if (document.querySelector('nav.color-bg-500')) {
    initOfflineSync();
  }
});

// Clear IndexedDB on logout
let logoutInProgress = false;
document.addEventListener('click', (event) => {
  if (logoutInProgress) return;

  const button = event.target.closest('button');
  const form = button?.closest('form');
  if (form?.action?.includes('/users/sign_out')) {
    event.preventDefault();
    event.stopPropagation();
    logoutInProgress = true;

    // Close all open connections before deleting the database
    if (window.OfflineDB?.db) {
      window.OfflineDB.db.close();
      window.OfflineDB.db = null;
    }

    // Tell the service worker to close its connection, then unregister it
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage('close-indexeddb');
    }
    navigator.serviceWorker?.getRegistrations().then(registrations => {
      registrations.forEach(r => r.unregister());
    });

    // Small delay to let the service worker close its connection
    setTimeout(() => {
      const request = indexedDB.deleteDatabase('pim-offline');
      request.onsuccess = () => form.requestSubmit(button);
      request.onerror = () => form.requestSubmit(button);
      request.onblocked = () => form.requestSubmit(button);
    }, 100);
  }
});

// Helper to sync single item after CRUD operations
window.syncOfflineItem = async function(action, store, item) {
  if (typeof window.OfflineDB === 'undefined') return;

  try {
    await window.OfflineDB.open();
    if (action === 'delete') {
      await window.OfflineDB.delete(store, item.id);
    } else {
      await window.OfflineDB.save(store, item);
    }
  } catch (e) {
    // Silent fail
  }
};
