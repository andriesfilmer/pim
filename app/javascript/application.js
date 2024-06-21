// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails

import "@hotwired/turbo-rails"
import "@hotwired/stimulus"
import "jquery"
import "controllers"
//import "components"
//
//Turbo.session.drive = false

Turbo.setConfirmMethod((message, element) => {
  //console.log(message, element)
  let dialog = document.getElementById("turbo-confirm")
  dialog.showModal()
  dialog.querySelector("p").textContent = message

  return new Promise((resolve, reject) => {
    dialog.addEventListener("close", () => {
      resolve(dialog.returnValue == "confirm")
    }, { once: true })
  })
})

document.addEventListener('turbo:load', loadFunction);
document.addEventListener('turbo:frame-load', loadFunction); // If you're using Turbo Frames
document.addEventListener('turbo:submit-end', (event) => {
  if (!event.detail.success) {
    loadFunction();
  }
});

function loadFunction() {

  // Set light-theme as default if theme not set.
  if (localStorage.getItem('theme') === null) {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.add(localStorage.getItem('theme'));
  }

  // Hide flash messages
  $("#flash, #dialog_flash").click(function(event) {
    $( event.target ).closest( ".flash" ).hide('slow');
  });

  // Clear search box
  const searchEl = document.getElementById('search');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      //console.log(`Search value: "${e.currentTarget.value}"`);
      if ( e.currentTarget.value === "") {
        document.cookie = "search=";
      }
    });
  }

};

// Begin Service Worker code
// -------------------------
// 1 Register the service worker to manage caching and offline functionality (/service-worker.js)
// 2 Handle the beforeinstallprompt event to prompt the user to install the PWA.
// 3 Create UI elements to trigger the install prompt.
//
// This setup ensures that your PWA will prompt users for installation when the conditions are met.

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(error => {
      console.log('ServiceWorker registration failed: ', error);
    });
  });
}

//  Prompt for Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
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
  // Show the install button
  const installButton = document.getElementById('installButton');
  installButton.classList.remove('display-none');

  installButton.addEventListener('click', (e) => {
    // Hide the app provided install button
    installButton.classList.add('display-none');
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });
}

// End Service Worker code
// -----------------------
