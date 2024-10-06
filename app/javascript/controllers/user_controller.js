// user_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    console.log("######## user controller connected");

    //if (window.matchMedia('(prefers-color-scheme: light)').matches || window.matchMedia('(prefers-color-scheme: dark)').matches) {
    //  document.getElementById("theme_sys").checked = true;
    if (localStorage.getItem("theme") === "dark-theme") {
      document.getElementById("theme_dark").checked = true;
    } else if (localStorage.getItem("theme") === "light-theme") {
      document.getElementById("theme_light").checked = true;
    } else if (localStorage.getItem("theme") === "sys-theme") {
      document.getElementById("theme_sys").checked = true;
    } else {
      // Default light theme.
      document.getElementById("theme_light").checked = true;
    }
  }

  setTheme() {
    document.body.className = "";
    if (document.getElementById("theme_light").checked) {
      document.body.classList.add("light-theme");
      localStorage.setItem("theme", "light-theme");
    } else if (document.getElementById("theme_dark").checked) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark-theme");
    } else if (document.getElementById("theme_sys").checked) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.body.classList.add("dark-theme");
        localStorage.setItem("theme", "dark-theme");
      } else {
        document.body.classList.add("light-theme");
        localStorage.setItem("theme", "light-theme");
      }
    }
  }
}
