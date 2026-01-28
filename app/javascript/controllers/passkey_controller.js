// passkey_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { tooltip, saveFormAlert, showTags, compareVersions, modalComponent, copyContent, genPassword } from 'components';

let submitted = false
let userinput = false

export default class extends Controller {

  static targets = [ "passwordToggle", "notesToggle", "copiedPassword", "copiedUsername" ]

  connect() {

    console.log("######## connect passkey controller")

    // Set cache control of current page to `no-cache`
    Turbo.cache.exemptPageFromCache()

    // Show tooltips for this controller
    tooltip()

    modalComponent()

    // Show tagsContainer
    if (document.getElementById("passkey_tags")) {
      showTags("passkey_tags")
    }
    if (document.getElementById("passkey_version_tags")) {
      showTags("passkey_version_tags")
    }


    // Show a warning if form data is changed.
    $(document).on('input', '.userinputs', function() {
      saveFormAlert()
      return userinput = true;
    });

    // If turbo off
    window.onbeforeunload = function () {
      if (userinput && !submitted) {
        return false;
      }
    }
    // If turbo on
    addEventListener("turbo:before-visit", (event) => {
      if (userinput && !submitted) {
        let oke = confirm("Changes that you made may not be saved!")
        if (oke) {
        } else {
          event.preventDefault()
        }
        return userinput = false
      }
    }, { once: true })
  }

  showSearch() {
    $("#show_search").removeClass("display-none");
    $("#search").focus();
  }

  search() {
    document.getElementById("search-form").requestSubmit()
  }

  // copyUsername with stimulus targets instead of document.querySelector, see copyPassword.
  copyUsername() {
    copyContent(document.getElementById('username').innerHTML)
    this.copiedUsernameTarget.textContent = "Copied"
    this.copiedUsernameTarget.classList.remove("icon")
    setTimeout(() => {
      this.copiedUsernameTarget.textContent = ""
      this.copiedUsernameTarget.classList.add("icon")
    }, 2000); // 2-second delay
  }

  // copyPassword - fetches password via AJAX if not already loaded
  async copyPassword(event) {
    const passwordField = document.getElementById('password');
    const element = event.currentTarget;
    const passkeyId = element.dataset.passkeyId;

    // Fetch password if not already loaded
    if (!passwordField.value) {
      element.innerHTML = "Loading..."
      element.classList.remove("icon")
      try {
        const response = await fetch(`/passkeys/${passkeyId}/password`, {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          passwordField.value = data.password;
        } else {
          element.innerHTML = "Error"
          setTimeout(() => {
            element.innerHTML = ""
            element.classList.add("icon")
          }, 2000);
          return;
        }
      } catch (error) {
        console.error('Failed to fetch password:', error);
        element.innerHTML = "Error"
        setTimeout(() => {
          element.innerHTML = ""
          element.classList.add("icon")
        }, 2000);
        return;
      }
    }

    copyContent(passwordField.value)
    element.innerHTML = "Copied"
    element.classList.remove("icon")
    setTimeout(() => {
      element.innerHTML = ""
      element.classList.add("icon")
    }, 2000);
  }

  newPassword() {
    document.getElementById("passkey_password").value = genPassword()
  }

  async togglePassword() {
    const passwordField = this.passwordToggleTarget;
    const passkeyId = passwordField.dataset.passkeyId;

    // Fetch password if not already loaded and we're about to show it
    if (!passwordField.value && passwordField.type === "password" && passkeyId) {
      passwordField.placeholder = "Loading...";
      try {
        const response = await fetch(`/passkeys/${passkeyId}/password`, {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          passwordField.value = data.password;
          passwordField.placeholder = "";
        } else {
          passwordField.placeholder = "Error loading password";
          return;
        }
      } catch (error) {
        console.error('Failed to fetch password:', error);
        passwordField.placeholder = "Error loading password";
        return;
      }
    }

    if (passwordField.type === "text") {
      passwordField.type = "password"
      passwordField.classList.remove("color-warning")
    } else {
      passwordField.type = "text"
      passwordField.classList.add("color-warning")
    }
  }

  set2fa() {
    if (document.getElementById("passkey_twofa").checked) {
      document.getElementById("show2fa").classList.add("icon")
    } else {
      document.getElementById("show2fa").classList.remove("icon")
    }
  }

  toggleNotes() {
    $("#markdown").html(DOMPurify.sanitize(marked.parse($("#notes").text(),{ mangle: false, headerIds: false})))

    if (this.notesToggleTarget.classList.toggle("hide-notes")) {
      this.notesToggleTarget.textContent = "Click to show notes"
      this.notesToggleTarget.classList.remove("color-warning");
      this.notesToggleTarget.classList.add("disabled");
    } else {
      this.notesToggleTarget.classList.remove("disabled");
      this.notesToggleTarget.classList.add("color-warning");
    }
    if (this.notesToggleTarget.textContent === "" ) {
      this.notesToggleTarget.textContent = "No notes yet..."
    }
  }

  showMarkdown() {
    const notesValue = $("#passkey_notes").val();
    if (notesValue !== undefined && notesValue !== null && notesValue !== "") {
      $("#markdown").html(DOMPurify.sanitize(marked.parse(notesValue, { mangle: false, headerIds: false})));
      $("#markdown").removeClass("display-none");
      $("#edit_bt").removeClass("display-none");
      $("#preview_bt").addClass("display-none");
      $("#passkey_notes").addClass("display-none");
    } else {
      console.error("Could not find #passkey_notes or value is undefined/null/empty");
    }
  }

  hideMarkdown() {
    $("#markdown").addClass("display-none");
    $("#edit_bt").addClass("display-none");
    $("#preview_bt").removeClass("display-none");
    $("#passkey_notes").removeClass("display-none");
  }

  submitForm(event) {
    document.getElementById("passkeyForm").requestSubmit();
    return userinput = false
  }

  versions() {
    compareVersions()
  }

  openShareDialog() {
    let dialog = document.getElementById("shareDialog")
    dialog.showModal();
  }

  closeShareDialog() {
    let dialog = document.getElementById("shareDialog")
    dialog.close();
  }

}
