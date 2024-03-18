// event_controller.js
import { Controller } from "@hotwired/stimulus";
import { marked } from "marked";
//import moment from 'moment';
import { tooltip, saveFormAlert, compareVersions } from "components";

let submitted = false
let userinput = false

function getTZDiff(timeZone1, timeZone2) {

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

function setDatetimeForm(loadDateTime = 0) {

  let tz = document.getElementById("event_tz").value
  let tzBrowser = Intl.DateTimeFormat().resolvedOptions().timeZone
  console.log("######## tz: " + tz);
  console.log("######## tzBrowser: " + tzBrowser);

  if (loadDateTime) {
    console.log("######## loadDateTime");
    let offset = getTZDiff(tz, "UTC")
    let start = document.getElementById("event_start_date").value + ' ' + document.getElementById("event_start_time").value
    let end = document.getElementById("event_end_date").value + ' ' + document.getElementById("event_end_time").value
    document.getElementById("event_start").value = moment(start).minutes(offset).format("YYYY-MM-DD HH:mm") + ' ' + 'UTC'
    document.getElementById("event_end").value = moment(end).minutes(offset).format("YYYY-MM-DD HH:mm") + ' ' +  'UTC'
  } else {
    console.log("######## changeDatetime");
    let offset = getTZDiff("UTC", tz)
    let start = moment(new Date(document.getElementById("event_start").value)).utc()
    let end = moment(new Date(document.getElementById("event_end").value)).utc()
    document.getElementById("event_start_date").value = moment(start).minutes(offset).format('YYYY-MM-DD')
    document.getElementById("event_start_time").value = moment(start).minutes(offset).format('HH:mm')
    document.getElementById("event_end_date").value = moment(end).minutes(offset).format('YYYY-MM-DD')
    document.getElementById("event_end_time").value = moment(end).minutes(offset).format('HH:mm')
  }
  if (tzBrowser !== tz) {
    $(".tz-warning").removeClass("display-none")
    $(".tz-warning").parent().css("border", "solid 2px orange")
    $(".show-timezones").removeClass("display-none");
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
      setDatetimeForm()
    }

  }

  connect() {
    console.log("######## connect event controller")
    // Set cache control of current page to `no-cache`
    Turbo.cache.exemptPageFromCache()

    // Show tooltips for this controller
    tooltip()
    $("#markdown").html(marked.parse($("#description").text(),{ mangle: false, headerIds: false}))

    // On each input change prepare the values  to store in db.
    $(document).on('input', '[data-tojson]', function() {
      prepareTypeValues(event.target.id)
    })

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
    let loadDateTime = 1
    setDatetimeForm(loadDateTime)
    saveFormAlert()
    return userinput = true
  }

  showTimezones() {
    document.getElementById("show-timezones").classList.toggle("display-none");
  }

  changeTz() {
    setDatetimeForm()
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
    let loadDateTime = 1
    setDatetimeForm(loadDateTime)
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
