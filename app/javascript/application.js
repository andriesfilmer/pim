// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails

import "@hotwired/turbo-rails"
import "@hotwired/stimulus"
import "jquery"
import "controllers"
import "components"
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

$(document).on('turbo:load', function() {

  // Hide flash messages
  $("#flash").click(function(event) {
    $( event.target ).closest( ".flash" ).hide('slow');
  });

  // Clear search box
  document.getElementById('search').addEventListener('input', (e) => {
    console.log(`Search value: "${e.currentTarget.value}"`);
    if ( e.currentTarget.value === "") {
      console.log("######## cleared cookie: ");
      document.cookie = "search="
    }
  });

});
