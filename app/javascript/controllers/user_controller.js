// user_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  connect() {
    console.log("######## user controller connected");

    if (localStorage.getItem('theme') === "dark-theme") {
      document.getElementById("theme_dark").checked = true
    } else {
      document.getElementById("theme_light").checked = true
    }
  }

  setTheme() {
    document.body.className = '';
    if (document.getElementById("theme_light").checked) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light-theme');
    } else if (document.getElementById("theme_red").checked) {
      document.body.classList.add('red-theme');
      localStorage.setItem('theme', 'red-theme');
    } else {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark-theme');
    }
  }

}
