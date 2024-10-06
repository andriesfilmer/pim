// user_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    console.log("######## user controller connected");

    // Set switch in profile to system, light or dark theme.
    if (localStorage.getItem("theme") === "light-theme") {
      document.getElementById("theme_light").checked = true;
    } else if (localStorage.getItem("theme") === "dark-theme") {
      document.getElementById("theme_dark").checked = true;
    } else {
      // Default light theme.
      document.getElementById("theme_light").checked = true;
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
}
