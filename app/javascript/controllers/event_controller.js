// event_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from 'marked';
import { tooltip, saveFormAlert, compareVersions } from 'components';

let submitted = false
let userinput = false

function setTz(tz, start, end) {
  const tzBrowser = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log("######## tzBrowser: " + tzBrowser);
  console.log("######## tz: " + tz);
  const start_date = new Date(start).toLocaleString('sv-SE', { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  console.log("######## start_date: " + start_date);
  const start_time = new Date(start).toLocaleString('sv-SE', { timeZone: tz, hour: "2-digit", minute: "2-digit" });
  console.log("######## start_time: " + start_time);
  const end_date = new Date(end).toLocaleString('sv-SE', { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  console.log("######## end_date: " + end_date);
  const end_time = new Date(end).toLocaleString('sv-SE', { timeZone: tz, hour: "2-digit", minute: "2-digit" });
  console.log("######## end_time: " + end_time);
  document.getElementById("tzBrowser").value = tzBrowser;
  document.getElementById("event_start_date").value = start_date;
  document.getElementById("event_start_time").value = start_time;
  document.getElementById("event_end_date").value = end_date;
  document.getElementById("event_end_time").value = end_time;
  if (tzBrowser !== tz) {
    $(".tz-warning").removeClass("display-none")
    $(".tz-warning").parent().css("border", "solid 2px orange")
  }
}

export default class extends Controller {

  initialize() {
    console.log("######## init event controller");
    if (document.getElementById("calendar")) {
    let calendarEl = document.getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
      events: '/events.json',
      initialView: 'dayGridMonth',
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      weekNumbers: true,
      headerToolbar: {
        left: 'prevYear, prev',
        center: 'title',
        right: 'next, nextYear multiMonthYear, dayGridMonth, listMonth, timeGridWeek, listWeek, today'
      },
      dateClick: function(info) {
        window.location.href = '/events/new?start=' + info.dateStr + '&end=' + info.dateStr;
      },
      eventClick: function(arg) {
        console.dir(arg);
        console.log("######## arg.event.id: " + arg.event.id);
        location.href = "/events/" + arg.event.id;
      }
    });
    calendar.render();
    }

    if (document.getElementById("event_tz")) {
      setTz(document.getElementById("event_tz").value, document.getElementById("event_start").value, document.getElementById("event_end").value)
    }

  }

  connect() {
    console.log("######## connect event controller")
    // Set cache control of current page to `no-cache`
    Turbo.cache.exemptPageFromCache()
    //
    //document.addEventListener("turbo:before-cache", function() {
    //  console.log("######## before cache event controller");
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
    //$(document).on('input', '.userinputs', function() {
    //  saveFormAlert()
    //  return userinput = true;
    //});

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

  showYearView() {
    $(".fc-multiMonthYear-button").click();
  }

  showMonthView() {
    $(".fc-dayGridMonth-button").click();
  }

  showListMonth() {
    $(".fc-listMonth-button").click();
  }

  showWeekView() {
    $(".fc-timeGridWeek-button").click();
  }

  gotoToday() {
    $(".fc-today-button").click();
  }

  showSearch() {
    $("#show_search").removeClass("display-none");
    $("#event_search").focus();
  }

  changeStartTime() {
    let start = document.getElementById("event_start_date").value + ' ' + document.getElementById("event_start_time").value;
    let tz = document.getElementById("event_tz").value
    document.getElementById("event_start").value = new Date(start).toLocaleString('sv-SE',
      { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    if (tzBrowser !== tz) {
      $('event_tz option[value="Asia/Calcutta"]')
      $(".tz-warning").parent().removeClass("display-none")
      $(".tz-warning").parent().css("border", "solid 2px orange")
    }
  }
  changeEndTime() {
    let end = document.getElementById("event_end_date").value + ' ' + document.getElementById("event_end_time").value;
    let tz = document.getElementById("event_tz").value
    document.getElementById("event_end").value = new Date(end).toLocaleString('sv-SE',
      { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  toggleAllDay() {
    if($("#event_allDay").is(':checked')) {
      $('#event_start_time').addClass('display-none')
      $('#event_start_time').val("00:00")
      $('#event_end_time').addClass('display-none')
      $('#event_end_time').val("00:00")
    } else {
      $('#event_start_time').removeClass('display-none')
      $('#event_start_time').val("08:00")
      $('#event_end_time').removeClass('display-none')
      $('#event_end_time').val("09:00")
    }
  }

  showMarkdown() {
    $("#markdown").html(marked.parse($("#event_description").val(),{ mangle: false, headerIds: false}));
    $("#markdown").removeClass("display-none");
    $("#edit_bt").removeClass("display-none");
    $("#preview_bt").addClass("display-none");
    $("#event_description").addClass("display-none");
  }

  hideMarkdown() {
    $("#markdown").addClass("display-none");
    $("#edit_bt").addClass("display-none");
    $("#preview_bt").removeClass("display-none");
    $("#event_description").removeClass("display-none");
  }

  submitForm(event) {
    document.getElementById("eventForm").requestSubmit();
    return userinput = false
  }

  versions() {
    compareVersions()
  }

}
