// event_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from 'marked';
import { tooltip, saveFormAlert, compareVersions } from 'components';

let submitted = false
let userinput = false

export default class extends Controller {

  connect() {
    console.log("######## connect event controller")
    let calendarEl = document.getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
      events: '/events.json',
      initialView: 'dayGridMonth',
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      headerToolbar: {
        left: 'prevYear,prev,next,nextYear today',
        center: 'title',
        right: 'multiMonthYear, dayGridMonth, listMonth, timeGridWeek, listWeek'
      },
      dateClick: function(info) {
        console.log('Clicked on: ' + info.dateStr);
      },
      eventClick: function(arg) {
        console.dir(arg);
        console.log("######## arg.event.id: " + arg.event.id);
        location.href = "/contacts/590";
      }
    });
    calendar.render();

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

    // On each input change prepare the values  to store in db.
    $(document).on('input', '[data-tojson]', function() {
      prepareTypeValues(event.target.id)
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
    $("#show_search").removeClass("display-none");
    $("#contact_search").focus();
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
    document.getElementById("contactForm").requestSubmit();
    return userinput = false
  }

  versions() {
    compareVersions()
  }

}
