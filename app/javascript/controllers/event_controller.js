// event_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from "marked";
import { tooltip, saveFormAlert, showTags, compareVersions } from "components";

let submitted = false
let userinput = false

function tzOffset(timeZone1,timeZone2) {

  // Get current date and time in each time zone
  const date1 = new Date().toLocaleString("en-US", { timeZone: timeZone1 });
  const date2 = new Date().toLocaleString("en-US", { timeZone: timeZone2 });

  // Convert the dates to Date objects
  const dateObj1 = new Date(date1);
  const dateObj2 = new Date(date2);

  // Calculate the absolute time difference in milliseconds
  const timeDifference = Math.abs(dateObj1 - dateObj2);

  // Determine the earlier time zone
  let minutesDifference;
  if (dateObj1 < dateObj2) {
    // Convert milliseconds to minutes positive
    minutesDifference = Math.floor(timeDifference / 1000 / 60);
  } else {
    // Convert milliseconds to minutes negative
    minutesDifference = Math.floor(timeDifference / 1000 / 60) * -1;
  }

  return minutesDifference;
}

function showTimezoneAlert() {

  let tzBrowser = Intl.DateTimeFormat().resolvedOptions().timeZone
  let tzInput = document.getElementById("event_tz");
  let tz = tzInput.value || Intl.DateTimeFormat().resolvedOptions().timeZone;
  tzInput.value = tz;

  if (tzOffset(tzBrowser, tz) !== 0) {

    // Show timezone info if element 'tzBrowser' exists.
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
    $(".tz-warning").parent()
      .css("color", "var(--color-warning)")
      .css("background-color", "var(--bg-warning)")
      .css("padding", "1em 0")
      .css("border-radius", "1rem")
    $(".tz-warning").removeClass("display-none")
    $(".tz-warning").addClass("display-inline") // Labels on show page need display-inline
    $(".tz-show").removeClass("display-none")

  }
}

export default class extends Controller {

  initialize() {

    console.log("######## init event controller");

    // After new or update we get a 'date' parameter to use as initialDate (dayGridMonth).
    let params = new URLSearchParams(window.location.search);
    let start = params.get('date')

    if (document.getElementById("calendar")) {
      let calendarEl = document.getElementById('calendar');
      let calendar = new FullCalendar.Calendar(calendarEl, {
        events: '/events.json',
        initialDate: start,
        initialView: 'dayGridMonth',
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        weekNumbers: true,
        firstDay: 1,
        height: 'auto',
        headerToolbar: {
          left: 'prevYear, prev',
          center: 'title',
          right: 'next, nextYear multiMonthYear, dayGridMonth, listMonth, timeGridWeek, listWeek, today'
        },
        editable: false,
        //eventDrop: function(info) {
        //  console.dir(info.event.id);
        //  console.dir(info.event._instance.range.start);
        //  console.dir(info.event._instance.range.end);
        //  Turbo.visit('/events/' + info.event.id + '/edit?start=' + info.event._instance.range.start + '&end=' + info.event._instance.range.end);
        //},
        dateClick: function(info) {
          window.location.href = '/events/new?start=' + info.dateStr + '&end=' + info.dateStr;
        },
        eventClick: function(arg) {
          console.dir(arg);
          Turbo.visit("/events/" + arg.event.id);
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
    if (document.getElementById("event_tags")) {
      showTags("event_tags")
    }
    if (document.getElementById("event_version_tags")) {
      showTags("event_version_tags")
    }

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

  //gotoToday() {
  //  $(".fc-today-button").click();
  //}

  showSearch() {
    $("#show_search").removeClass("display-none");
    $("#search").focus();
  }

  search() {
    document.getElementById("search-form").requestSubmit()
  }

  changeDatetime() {
    let start_date = document.getElementById("event_start_date").value
    let start_time = document.getElementById("event_start_time").value.substring(0,5)
    let end_date = document.getElementById("event_end_date").value
    let end_time = document.getElementById("event_end_time").value.substring(0,5)

    if( start_date >= end_date ) {
      let dateObject = new Date(start_date);
      dateObject.setDate(dateObject.getDate());
      var formattedDate = dateObject.toISOString().split('T')[0];
      document.getElementById("event_end_date").value = formattedDate;
    }

    if (start_time >= end_time) {
      let [hours, minutes] = start_time.split(':').map(Number);
      hours = (hours + 1) % 24;
      let formattedTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
      document.getElementById("event_end_time").value = formattedTime;
    }

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
    $("#markdown").html(marked.parse($("#event_notes").val(),{ mangle: false, headerIds: false}));
    $("#markdown").removeClass("display-none");
    $("#edit_bt").removeClass("display-none");
    $("#preview_bt").addClass("display-none");
    $("#event_notes").addClass("display-none");
  }

  hideMarkdown() {
    $("#markdown").addClass("display-none");
    $("#edit_bt").addClass("display-none");
    $("#preview_bt").removeClass("display-none");
    $("#event_notes").removeClass("display-none");
  }

  submitForm(event) {
    document.getElementById("eventForm").requestSubmit();
    return userinput = false
  }

  versions() {
    compareVersions()
  }

}
