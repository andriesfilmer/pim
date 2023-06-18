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

