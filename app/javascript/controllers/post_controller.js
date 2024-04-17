// post_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from 'marked';
import { tooltip, saveFormAlert, showTags, compareVersions, modalComponent, markdownToc } from 'components';

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
    if (document.getElementById("post_tags")) {
      showTags("post_tags")
    }
    if (document.getElementById("post_version_tags")) {
      showTags("post_version_tags")
    }


    if (document.getElementById("notes")) {

      let content = document.getElementById("notes").innerHTML;
      let toc = markdownToc(content);

      if (toc) {
        document.getElementById("toc").innerHTML = marked.parse(toc, { mangle: false, headerIds: false})
      } else {
        document.getElementById("tocFieldset").remove();
      }
      $("#markdown").html(marked.parse(content, { mangle: false, headerIds: true }))
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
