// passkey_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from 'marked';
import { tooltip, saveFormAlert, showTags, compareVersions, modalComponent, copyContent, genPassword } from 'components';

let submitted = false
let userinput = false

export default class extends Controller {

  static targets = [ "passwordToggle", "notesToggle" ]

  connect() {

    console.log("######## connect passkey controller")

    // Set cache control of current page to `no-cache`
    Turbo.cache.exemptPageFromCache()

    // Show tooltips for this controller
    tooltip()

    modalComponent()

    // Show tagsContainer
    showTags("passkey_tags")

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

  copyUsername() {
    copyContent(document.getElementById('username').innerHTML)
  }

  newPassword() {
    document.getElementById("passkey_password").value = genPassword()
  }

  copyPassword() {
    copyContent(document.getElementById('password').value)
  }

  togglePassword() {
    if (this.passwordToggleTarget.type === "text") {
      this.passwordToggleTarget.type = "password"
      this.passwordToggleTarget.classList.remove("warning-color")
    } else {
      this.passwordToggleTarget.type = "text"
      this.passwordToggleTarget.classList.add("warning-color")
    }
  }

  toggleNotes() {
    $("#markdown").html(marked.parse($("#notes").text(),{ mangle: false, headerIds: false}))

    if (this.notesToggleTarget.classList.toggle("hide-notes")) {
      this.notesToggleTarget.textContent = "Click to show notes"
      this.notesToggleTarget.classList.remove("warning-color");
      this.notesToggleTarget.classList.add("disabled");
    } else {
      this.notesToggleTarget.classList.remove("disabled");
      this.notesToggleTarget.classList.add("warning-color");
    }
    if (this.notesToggleTarget.textContent === "" ) {
      this.notesToggleTarget.textContent = "No notes yet..."
    }
  }

  showMarkdown() {
    $("#markdown").html(marked.parse($("#passkey_notes").val(),{ mangle: false, headerIds: false}));
    $("#markdown").removeClass("display-none");
    $("#edit_bt").removeClass("display-none");
    $("#preview_bt").addClass("display-none");
    $("#passkey_notes").addClass("display-none");
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
