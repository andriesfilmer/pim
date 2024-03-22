// event_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from "marked";
import { tooltip, saveFormAlert, showTags, compareVersions } from "components";

let submitted = false
let userinput = false

function showTimezoneAlert() {

  let tzBrowser = Intl.DateTimeFormat().resolvedOptions().timeZone
  let tzInput = document.getElementById("event_tz");
  let tz = tzInput.value || Intl.DateTimeFormat().resolvedOptions().timeZone;
  tzInput.value = tz;

  if (tzBrowser !== tz) {

    if (document.getElementById("tzBrowser")) {
      let start = document.getElementById("event_start").value
      let end = document.getElementById("event_end").value
      let start_date = new Date(start).toLocaleString('en',
        { weekday: "long", year: "numeric",  month: "long",  day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false});
      let end_date = new Date(end).toLocaleString('en',
        { weekday: "long", year: "numeric",  month: "long",  day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false});

      document.getElementById("tzBrowser").innerHTML = tzBrowser
      document.getElementById("browserEventStart").innerHTML = start_date
      document.getElementById("browserEventEnd").innerHTML = end_date
    }

    // Show form select tz
    $("#tz").removeClass("display-none")
    // Show warning border
    $(".tz-warning").parent().css("border", "solid 2px orange")
    $(".tz-warning").removeClass("display-none")
    $(".tz-warning").addClass("display-inline") // Labels on show page need display-inline
    $(".tz-show").removeClass("display-none")

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
      showTimezoneAlert()
    }

  }

  connect() {
    console.log("######## connect event controller")
    // Set cache control of current page to `no-cache`
    Turbo.cache.exemptPageFromCache()

    // Show tooltips
    tooltip()

    // Show tagsContainer
    showTags("event_tags")

    $("#markdown").html(marked.parse($("#description").text(),{ mangle: false, headerIds: false}))

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

  changeDatetime() {
    saveFormAlert()
    return userinput = true
  }

  showTimezones() {
    document.getElementById("tz").classList.toggle("display-none");
  }

  changeTz() {
    saveFormAlert()
    return userinput = true
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
    saveFormAlert()
    return userinput = true
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
