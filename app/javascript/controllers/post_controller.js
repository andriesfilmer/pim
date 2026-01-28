// post_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { gfmHeadingId } from "marked-gfm-heading-id";
import {
  tooltip,
  saveFormAlert,
  showTags,
  compareVersions,
  modalComponent,
  copyContent,
  markdownToc,
} from "components";

let submitted = false;
let userinput = false;

export default class extends Controller {
  connect() {
    console.log("######## connect post controller");
    //
    // Set cache control of current page to `no-cache`
    Turbo.cache.exemptPageFromCache();

    // Show tooltips for this controller
    tooltip();

    modalComponent();

    // Show tagsContainer
    if (document.getElementById("post_tags")) {
      showTags("post_tags");
    }
    if (document.getElementById("post_version_tags")) {
      showTags("post_version_tags");
    }

    if (document.getElementById("notes")) {
      let content = document.getElementById("notes").value;
      let toc = markdownToc(content);

      // Only to get id's in the headers for jumping to form toc anchors.
      marked.use(gfmHeadingId());

      if (toc) {
        document.getElementById("toc").innerHTML = DOMPurify.sanitize(marked.parse(toc, {
          mangle: false,
          headerIds: false,
        }));
      } else {
        document.getElementById("tocFieldset").remove();
      }
      $("#markdown").html(
        DOMPurify.sanitize(marked.parse(content, { mangle: false, headerIds: false })),
      );
    }

    // Show a warning if form data is changed.
    $(document).on("input", ".userinputs", function () {
      saveFormAlert();
      return (userinput = true);
    });

    // If turbo off
    window.onbeforeunload = function () {
      if (userinput && !submitted) {
        return false;
      }
    };
    // If turbo on
    addEventListener(
      "turbo:before-visit",
      (event) => {
        if (userinput && !submitted) {
          let oke = confirm("Changes that you made may not be saved!");
          if (oke) {
          } else {
            event.preventDefault();
          }
          return (userinput = false);
        }
      },
      { once: true },
    );
  }

  showSearch() {
    $("#show_search").removeClass("display-none");
    $("#search").focus();
  }

  search() {
    document.getElementById("search-form").requestSubmit();
  }

  copyImageUrl(img) {
    let imgSize = document.getElementById("image_size").value;
    let imgId = img.srcElement.id;
    let imgTitle = document.getElementById(imgId).title;
    let imgTag;
    if ( imgTitle.slice(imgTitle.lastIndexOf('.')) === '.jpg' ) {
      // Show image
      imgTag = '![' + imgSize + '](<' + imgTitle + '>)'
    } else if ( imgTitle.slice(imgTitle.lastIndexOf('.')) === '.png' ) {
      // Show image
      imgTag = '![' + imgSize + '](<' + imgTitle + '>)'
    } else if ( imgTitle.slice(imgTitle.lastIndexOf('.')) === '.gif' ) {
      // Show image
      imgTag = '![' + imgSize + '](<' + imgTitle + '>)'
    } else {
      // Show link
      imgTag = "[" + imgTitle + "](<" + imgTitle + ">)";
    }
    copyContent(imgTag)
    $("#addFile").removeClass("show");
  }

  showMarkdown() {
    const notesValue = $("#post_notes").val();
    if (notesValue !== undefined && notesValue !== null) {
      $("#markdown").html(
        DOMPurify.sanitize(marked.parse(notesValue, { mangle: false, headerIds: false })),
      );
      $("#markdown").removeClass("display-none");
      $("#edit_bt").removeClass("display-none");
      $("#preview_bt").addClass("display-none");
      $("#post_notes").addClass("display-none");
    } else {
      console.error("Could not find #post_notes or value is undefined");
    }
  }

  hideMarkdown() {
    $("#markdown").addClass("display-none");
    $("#edit_bt").addClass("display-none");
    $("#preview_bt").removeClass("display-none");
    $("#post_notes").removeClass("display-none");
  }

  submitForm() {
    document.getElementById("postForm").requestSubmit();
    return (userinput = false);
  }

  versions() {
    compareVersions();
  }
}
