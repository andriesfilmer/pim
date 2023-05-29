// contact_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "name", "output" ]

  connect() {
    console.log("Connected Stimulus contact controller", this.element)
    $("#contact_search").focus();
  }

  greet() {
    this.outputTarget.textContent = `Hello, ${this.nameTarget.value}!`
  }

  prepareParams(event) {
    event.preventDefault;
    console.log("######## submit contact form");
    let test = [];
    let divs = document.querySelectorAll('[id^="contact_phone_"]');
      [].forEach.call(divs, function(div) {
      console.log("######## -> div.id: " + div.value);
      if ( 'contact_phone_type' == div.id) {
         test.push('{"type"' + ':"' + div.value + '"');
      } else {
         test.push('"value"' + ':"' + div.value + '"}');
      }
    });
    document.getElementById('contact_phones').value = '[' + test + ']';
    //this.element.action = "/contacts"
  }
}
