// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails

import "@hotwired/turbo-rails"
import "@hotwired/stimulus"
import "controllers"
import "jquery"
//
//Turbo.session.drive = false

// Prevent users from submitting a form by hitting Enter
$(document).on("keydown", ":input:not(textarea):not(:submit)", function(event) {
  if(event.keyCode == 13) {
    event.preventDefault();
    return false;
  }
});

// If a user initiated navigation away from the page or tries to close the window.
// Ask for additional confirmation if class '.userinputs' is changed.
$(document).ready(function() {
  let submitted = false;
  let userinput = false;

  $("form").submit(function() {
    submitted = true;
  });

  $(".userinputs").change(function() {
    userinput = true;
  });

  window.onbeforeunload = function () {
    if (userinput && !submitted) {
      return false;
    }
  }
});
