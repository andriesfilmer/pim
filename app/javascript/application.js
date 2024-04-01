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

  console.log("######## localStorage.getItem('theme'): " + localStorage.getItem('theme'));
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
