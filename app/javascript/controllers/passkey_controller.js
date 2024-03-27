// passkey_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from 'marked';
import { tooltip, saveFormAlert, showTags, compareVersions, modalComponent, copyContent } from 'components';

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

  copyPassword() {
    copyContent(document.getElementById('password').value)
  }

  togglePassword() {
    if (this.passwordToggleTarget.type === "text") {
      this.passwordToggleTarget.type = "password"
      this.passwordToggleTarget.style.background = ""
    } else {
      this.passwordToggleTarget.type = "text"
      this.passwordToggleTarget.style.background = "orange"
    }
  }

  toggleNotes() {
    console.log("######## this.notesToggleTarget.value: " + this.notesToggleTarget.textContent);
    console.dir(this.notesToggleTarget)
    $("#markdown").html(marked.parse($("#notes").text(),{ mangle: false, headerIds: false}))

    if (this.notesToggleTarget.classList.toggle("hide-notes")) {
      this.notesToggleTarget.style.color = "#eee"
      this.notesToggleTarget.style.background = "#eee"
    } else {
      this.notesToggleTarget.style.color = "#000"
      this.notesToggleTarget.style.background = "#fff"
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
}
