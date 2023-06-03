// contact_controller.js
import { Controller } from "@hotwired/stimulus"
import { marked } from 'marked';

export default class extends Controller {
  static targets = [ "name", "output" ]

  connect() {
    $("#markdown").html(marked.parse($("#notes").text(),{ mangle: false, headerIds: false}));
  }

  showSearch() {
    $("#show_search").removeClass("display-none");
    $("#contact_search").focus();
  }

  greet() {
    this.outputTarget.textContent = `Hello, ${this.nameTarget.value}!`
  }

  addPhone() {
    const element = document.getElementById("phones");
    const divRow = document.createElement("div");
    const divColumn1 = document.createElement("div");
    const divColumn2 = document.createElement("div");
    const divColumn3 = document.createElement("div");
    const inputType = document.createElement("INPUT");
    const inputValue = document.createElement("INPUT");
    const spanTrash = document.createElement("span");
    divRow.className = "row";
    divColumn1.className = "small-5 medium-5";
    divColumn2.className = "small-6 medium-6 columns";
    divColumn3.className = "small-1 medium-1 columns";
    divColumn3.setAttribute("data-action","click->contact#removePhone");
    inputType.type = "text";
    inputType.id = "contact_phone_type";
    inputType.value = "Mobile";
    inputType.placeholder = "Type...";
    inputValue.type = "text";
    inputValue.id = "contact_phone_value";
    inputValue.placeholder = "+31......";
    spanTrash.className = "ib-trash medium-icon";

    element.appendChild(divRow).appendChild(divColumn1).append(inputType);
    element.appendChild(divRow).appendChild(divColumn2).append(inputValue);
    element.appendChild(divRow).appendChild(divColumn3).append(spanTrash);
  }

  removePhone(e) {
    e.target.parentNode.parentNode.remove();
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

  prepareParams(event) {
    event.preventDefault;
    console.log("######## submit contact form");
    let test = [];
    let divs = document.querySelectorAll('[id^="contact_phone_"]');
      [].forEach.call(divs, function(div) {
      console.log("######## -> div.id: " + div.value);
      if ( 'contact_phone_type' == div.id) {
         test.push('{"type"' + ':"' + div.value + '"');
      } else {
         test.push('"value"' + ':"' + div.value + '"}');
      }
    });
    document.getElementById('contact_phones').value = '[' + test + ']';
    document.getElementById("contactForm").submit();
  }

}
