// contact_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { tooltip, saveFormAlert, showTags, compareVersions } from 'components';

let submitted = false
let userinput = false

// Function for each type into a json object to store in one field in db.
// Uses container divs (e.g. <div id="phones">) and form field names for lookups.
function prepareTypeValues(type) {
  let pluralType = getPluralType(type)
  if (!pluralType) return;

  let container = document.getElementById(pluralType);
  if (!container) return;

  let typeValues = [];
  let fields = container.querySelectorAll('[data-tojson]');
  [].forEach.call(fields, function(field) {
    if (field.id.endsWith('_type') || field.name?.endsWith('_type]') || field.name?.endsWith('_type')) {
       typeValues.push('{"type"' + ':"' + field.value + '"');
    } else {
       typeValues.push('"value"' + ':"' + field.value + '"}');
    }
  });

  let hiddenField = document.querySelector('#contactForm input[name="contact[' + pluralType + ']"]');
  if (hiddenField) {
    hiddenField.value = '[' + typeValues + ']';
  }
}

// Update all hidden JSON fields from visible type/value inputs.
function prepareAllTypeValues() {
  ['phone', 'email', 'address', 'company', 'website'].forEach(function(type) {
    prepareTypeValues(type);
  });
}

function getPluralType(type) {
  let jsonString
  if ( type == "phone" ) { jsonString = 'phones' }
  if ( type == "email" ) { jsonString = 'emails' }
  if ( type == "address" ) { jsonString = 'addresses' }
  if ( type == "website" ) { jsonString = 'websites' }
  if ( type == "company" ) { jsonString = 'companies' }
  return jsonString
}

function getValueType(type) {
  let valueType
  if ( type == "phone" ) { valueType = 'Mobile' }
  if ( type == "email" ) { valueType = 'Home' }
  if ( type == "address" ) { valueType = 'Home' }
  if ( type == "website" ) { valueType = 'Work' }
  if ( type == "company" ) { valueType = 'Function' }
  return valueType
}

function getPlaceholderValue(type) {
  let placeholderValue
  if ( type == "phone" ) { placeholderValue = '+31....' }
  if ( type == "email" ) { placeholderValue = 'email@domain.nl' }
  if ( type == "address" ) { placeholderValue = 'address, zipcode, city...' }
  if ( type == "website" ) { placeholderValue = 'https://....' }
  if ( type == "company" ) { placeholderValue = 'Companyname...' }
  return placeholderValue
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

    // Show tagsContainer
    if (document.getElementById("contact_tags")) {
      showTags("contact_tags")
    }
    if (document.getElementById("contact_version_tags")) {
      showTags("contact_version_tags")
    }

    $("#markdown").html(DOMPurify.sanitize(marked.parse($("#notes").text(),{ mangle: false, headerIds: false})))

    // On each input change prepare the values  to store in db.
    $(document).on('input', '[data-tojson]', function(event) {
      let container = this.closest('#phones, #emails, #addresses, #companies, #websites');
      if (container) {
        let typeMap = {phones: 'phone', emails: 'email', addresses: 'address', companies: 'company', websites: 'website'};
        prepareTypeValues(typeMap[container.id]);
      }
    })

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
    $("#show_search").removeClass("display-none")
    $("#search").focus()
  }

  search() {
    document.getElementById("search-form").requestSubmit()
  }

  // Set starred on icon click
  setStarred() {
    if (document.getElementById('contact_starred').value == '1') {
      document.getElementById('contact_starred').value = '0'
    } else {
      document.getElementById('contact_starred').value = '1'
    }
    document.getElementById("starredForm").requestSubmit();
  }

  addTypeValue(event) {
    let addRow = event.target.getAttribute("data-value")
    const element = document.getElementById(getPluralType(addRow))
    const divRow = document.createElement("div")
    const divColumn1 = document.createElement("div")
    const divColumn2 = document.createElement("div")
    const divColumn3 = document.createElement("div")
    const inputType = document.createElement("INPUT")
    const inputValue = document.createElement("INPUT")
    const iconTrash = document.createElement("div")
    divRow.className = "row"
    divColumn1.className = "small-5 medium-5 columns"
    divColumn2.className = "small-6 medium-6 columns"
    divColumn3.className = "small-1 medium-1 columns text-center"
    inputType.value = getValueType(addRow)
    inputType.placeholder = getValueType(addRow)
    inputType.type = "text"
    inputType.id = "contact_" + addRow + "_type"
    inputType.setAttribute("data-tojson","")
    inputValue.type = "text"
    inputValue.id = "contact_" + addRow + "_value"
    inputValue.setAttribute("data-tojson","")
    inputValue.placeholder = getPlaceholderValue(addRow)
    iconTrash.className = "icon delete"
    iconTrash.setAttribute("data-action","click->contact#removeTypeValue")
    iconTrash.setAttribute("data-value","contact_" + addRow)

    element.appendChild(divRow).appendChild(divColumn1).append(inputType)
    element.appendChild(divRow).appendChild(divColumn2).append(inputValue)
    element.appendChild(divRow).appendChild(divColumn3).append(iconTrash)
  }

  removeTypeValue(event) {
    let dataValue = event.target.getAttribute("data-value")
    let type = dataValue ? dataValue.split('_')[1] : null;
    event.target.parentNode.parentNode.remove();
    if (type) prepareTypeValues(type);
    saveFormAlert()
  }

  showMarkdown() {
    const notesValue = $("#contact_notes").val();
    if (notesValue !== undefined && notesValue !== null && notesValue !== "") {
      $("#markdown").html(DOMPurify.sanitize(marked.parse(notesValue, { mangle: false, headerIds: false})));
      $("#markdown").removeClass("display-none");
      $("#edit_bt").removeClass("display-none");
      $("#preview_bt").addClass("display-none");
      $("#contact_notes").addClass("display-none");
    } else {
      console.error("Could not find #contact_notes or value is undefined/null/empty");
    }
  }

  hideMarkdown() {
    $("#markdown").addClass("display-none");
    $("#edit_bt").addClass("display-none");
    $("#preview_bt").removeClass("display-none");
    $("#contact_notes").removeClass("display-none");
  }

  submitForm(event) {
    prepareAllTypeValues();
    document.getElementById("contactForm").requestSubmit();
    return userinput = false
  }

  versions() {
        compareVersions()
  }

}
