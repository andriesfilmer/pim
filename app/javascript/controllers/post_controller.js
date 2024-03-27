// post_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from 'marked';
import { tooltip, saveFormAlert, showTags, compareVersions, modalComponent } from 'components';

let submitted = false
let userinput = false

export default class extends Controller {

  connect() {
    console.log("######## connect post controller")
    //
    // Set cache control of current page to `no-cache`
    Turbo.cache.exemptPageFromCache()

    // Show tooltips for this controller
    tooltip()

    modalComponent()

    // Show tagsContainer
    showTags("post_tags")

    $("#markdown").html(marked.parse($("#notes").text(),{ mangle: false, headerIds: false}))

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
    $("#post_search").focus();
  }

  showMarkdown() {
    $("#markdown").html(marked.parse($("#post_notes").val(),{ mangle: false, headerIds: false}));
    $("#markdown").removeClass("display-none");
    $("#edit_bt").removeClass("display-none");
    $("#preview_bt").addClass("display-none");
    $("#post_notes").addClass("display-none");
  }

  hideMarkdown() {
    $("#markdown").addClass("display-none");
    $("#edit_bt").addClass("display-none");
    $("#preview_bt").removeClass("display-none");
    $("#post_notes").removeClass("display-none");
  }

  submitForm(event) {
    document.getElementById("postForm").requestSubmit();
    return userinput = false
  }

  versions() {
    compareVersions()
  }
}
