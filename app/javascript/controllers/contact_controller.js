// contact_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from 'marked';
import { tooltip, saveFormAlert } from 'components';

let submitted = false
let userinput = false

// Function for each type into a json object to store in one field in db.
function prepareTypeValues(fieldId) {
  console.log("######## fieldId: " + fieldId);
  let typeValues = [];
  let fieldIdArr = fieldId.split('_')
  let type = fieldIdArr[1]
  let divs = document.querySelectorAll('[id^="contact_' + type + '_"]');
  [].forEach.call(divs, function(div) {
    if ( 'contact_' + type + '_type' == div.id) {
       typeValues.push('{"type"' + ':"' + div.value + '"');
    } else {
       typeValues.push('"value"' + ':"' + div.value + '"}');
    }
  });
  document.getElementById('contact_' + type + 's').value = '[' + typeValues + ']';
}

export default class extends Controller {

  connect() {
    console.log("######## connect contact controller")
    //
    // Set cache control of current page to `no-cache`
    Turbo.cache.exemptPageFromCache()
    //
    //document.addEventListener("turbo:before-cache", function() {
    //  console.log("######## before cache contact controller");
    //})
    //
    // Set cache control of current page to `no-preview`
    //Turbo.cache.exemptPageFromPreview()

    // Show tooltips for this controller
    tooltip()

    $("#markdown").html(marked.parse($("#notes").text(),{ mangle: false, headerIds: false}))

    // On each input change prepare the values  to store in db.
    $(document).on('input', '[data-tojson]', function() {
      prepareTypeValues(event.target.id)
    })

    //$(".userinputs").change(function() {
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
    $("#contact_search").focus();
  }

  setStarred() {
    if (document.getElementById('contact_starred').value == 'true') {
      document.getElementById('contact_starred').value = 'false'
      $(".ib-star-filled").addClass("ib-star");
      $(".ib-star-filled").removeClass("ib-star-filled")
    } else {
      document.getElementById('contact_starred').value = 'true'
      $(".ib-star").addClass("ib-star-filled");
      $(".ib-star").removeClass("ib-star");
    }
    saveFormAlert()
    return userinput = true;
  }

  addTypeValue(event) {
    let addRow = event.target.getAttribute("data-value")
    const element = document.getElementById(addRow + "s")
    const divRow = document.createElement("div")
    const divColumn1 = document.createElement("div")
    const divColumn2 = document.createElement("div")
    const divColumn3 = document.createElement("div")
    const inputType = document.createElement("INPUT")
    const inputValue = document.createElement("INPUT")
    const spanTrash = document.createElement("span")
    divRow.className = "row"
    divColumn1.className = "small-5 medium-5"
    divColumn2.className = "small-6 medium-6 columns"
    divColumn3.className = "small-1 medium-1 columns"
    if (addRow === "phone") {
      inputType.value = "Mobile"
    } else if (addRow === "email") {
      inputType.value = "Email"
    }
    inputType.type = "text"
    inputType.id = "contact_" + addRow + "_type"
    inputType.setAttribute("data-tojson","")
    inputValue.type = "text"
    inputValue.id = "contact_" + addRow + "_value"
    inputValue.setAttribute("data-tojson","")
    inputValue.placeholder = "......"
    spanTrash.className = "ib-trash icon-medium"
    spanTrash.setAttribute("data-action","click->contact#removeTypeValue")
    spanTrash.setAttribute("data-value","contact_" + addRow)

    element.appendChild(divRow).appendChild(divColumn1).append(inputType)
    element.appendChild(divRow).appendChild(divColumn2).append(inputValue)
    element.appendChild(divRow).appendChild(divColumn3).append(spanTrash)
    prepareTypeValues('contact_email_type')
  }

  removeTypeValue(event) {
    event.target.parentNode.parentNode.remove();
    prepareTypeValues(event.target.getAttribute("data-value"))
    saveFormAlert()
  }

  showMarkdown() {
    $("#markdown").html(marked.parse($("#contact_notes").val(),{ mangle: false, headerIds: false}));
    $("#markdown").removeClass("display-none");
    $("#edit_bt").removeClass("display-none");
    $("#preview_bt").addClass("display-none");
    $("#contact_notes").addClass("display-none");
  }

  hideMarkdown() {
    $("#markdown").addClass("display-none");
    $("#edit_bt").addClass("display-none");
    $("#preview_bt").removeClass("display-none");
    $("#contact_notes").removeClass("display-none");
  }

  submitForm(event) {
    document.getElementById("contactForm").submit();
    return userinput = false
  }

}
