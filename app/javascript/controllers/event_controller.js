// event_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from 'marked';
import { tooltip, saveFormAlert, compareVersions } from 'components';

const getTimezoneOffset = (timeZone, date = new Date()) => {
  return date.toLocaleString("en", {timeZone, timeStyle: "long"}).split(" ").slice(-1)[0];
}

let submitted = false
let userinput = false

function setStartTime() {
  let start = document.getElementById("event_start").value;
  let tz = document.getElementById("event_tz").value
  let tzBrowser = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let start_date = new Date(start).toLocaleString('sv-SE', { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  let start_time = new Date(start).toLocaleString('sv-SE', { timeZone: tz, hour: "2-digit", minute: "2-digit" });
  let start_date_tzBrowser = new Date(start).toLocaleString('sv-SE', { timeZone: tzBrowser, year: "numeric", month: "2-digit", day: "2-digit" });
  let start_time_tzBrowser = new Date(start).toLocaleString('sv-SE', { timeZone: tzBrowser, hour: "2-digit", minute: "2-digit" });
  document.getElementById("event_start_date").value = start_date;
  document.getElementById("event_start_time").value = start_time;
  document.getElementById("event_start").value = new Date(start).toLocaleString('sv-SE',{ year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit" }) + ' ' + getTimezoneOffset(tz);

  if (document.getElementById("event_start_date_tzBrowser")) {
    document.getElementById("event_start_date_tzBrowser").value = start_date_tzBrowser;
    document.getElementById("event_start_time_tzBrowser").value = start_time_tzBrowser;
    document.getElementById("tzBrowser").value = tzBrowser;
  };
}

function setEndTime() {
  let end = document.getElementById("event_end").value;
  let tz = document.getElementById("event_tz").value;
  let tzBrowser = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let end_date = new Date(end).toLocaleString('sv-SE', { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  let end_time = new Date(end).toLocaleString('sv-SE', { timeZone: tz, hour: "2-digit", minute: "2-digit" });
  let end_date_tzBrowser = new Date(end).toLocaleString('sv-SE', { timeZone: tzBrowser, year: "numeric", month: "2-digit", day: "2-digit" });
  let end_time_tzBrowser = new Date(end).toLocaleString('sv-SE', { timeZone: tzBrowser, hour: "2-digit", minute: "2-digit" });
  document.getElementById("event_end_date").value = end_date;
  document.getElementById("event_end_time").value = end_time;
  document.getElementById("event_end").value = new Date(end).toLocaleString('sv-SE',{ year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit" }) + ' ' + getTimezoneOffset(tz);

  if (document.getElementById("event_start_date_tzBrowser")) {
    document.getElementById("event_end_date_tzBrowser").value = end_date_tzBrowser;
    document.getElementById("event_end_time_tzBrowser").value = end_time_tzBrowser;
  };
}

function tzWarning(tz) {
  if (Intl.DateTimeFormat().resolvedOptions().timeZone !== tz.value) {
    $(".timezones").addClass("display-none")
    $(".tz-browser").removeClass("display-none")
    $(".tz-warning").removeClass("display-none")
    $(".tz-warning").parent().css("border", "solid 2px orange")
    $(".tz-warning").parent().css("margin-bottom", "2em")
  }
}

export default class extends Controller {

  initialize() {
    console.log("######## init event controller");

    // On calendar page
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

    // On show and edit page
    if (document.getElementById("event_tz")) {
      if ($("#event_tz").val() == "") {
        $("#event_tz").val(Intl.DateTimeFormat().resolvedOptions().timeZone)
      }
      tzWarning(document.getElementById("event_tz"));
      setStartTime()
      setEndTime()
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

    $("#markdown").html(marked.parse($("#description").text(),{ mangle: false, headerIds: false}))

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
    setStartTime()
  }
  changeEndTime() {
    setEndTime()
  }

  showTimezones() {
    $("#event_tz").val(Intl.DateTimeFormat().resolvedOptions().timeZone)
    $(".timezones").addClass("display-none")
    $(".tz-browser").removeClass("display-none")
    $(".tz-warning").removeClass("display-none")
  }

  changeTz() {
    setStartTime()
    setEndTime()
  }

  toggleAllDay() {
    if($("#event_allDay").is(':checked')) {
      $('#event_start_time').addClass('display-none')
      $('#event_start_time').val("00:00")
      $('#event_end_time').addClass('display-none')
      $('#event_end_time').val("00:00")
      setStartTime()
      setEndTime()
    } else {
      $('#event_start_time').removeClass('display-none')
      $('#event_start_time').val("09:00")
      $('#event_end_time').removeClass('display-none')
      $('#event_end_time').val("10:00")
      setStartTime()
      setEndTime()
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
