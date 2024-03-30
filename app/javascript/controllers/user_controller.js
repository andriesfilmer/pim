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
    if (document.getElementById("theme_light").checked) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark-theme');
    }
  }

}
