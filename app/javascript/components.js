// https://www.freecodecamp.org/news/javascript-modules-a-beginner-s-guide-783f7d7a5fcc/
//
// Tooltip component
// -----------------

export function tooltip() {
    // Set all title values to data-tooltip values for tooltips.
    $("[data-tooltip]").each( function() {
      if (this.title !== '') {
        console.log("######## Tooltip title: " + this.title);
        $(this).attr('data-tooltip',this.title);
        this.title = '';
      }
    });
  //}

  // Set tooltip off/on
  $('[data-tooltip]').mouseover(function(e) {
    $(this).addClass('tooltip');
  });

  $('[data-tooltip]').mouseout(function(e) {
    $(this).removeClass('tooltip');
  });

  // On input elements with tab (keyboard) navigation set tooltip off/on
  $('[data-tooltip]').focusin(function(e) {
    $(this).addClass('tooltip');
  });

  $('[data-tooltip').focusout(function(e) {
    $(this).removeClass('tooltip');
  });

}


export function formChanged() {
  let submitted = false
  let userinput = false

  let contactFormCheck = document.getElementById('contactForm')
  contactFormCheck && contactFormCheck.addEventListener('submit', function(event) {
    console.log("######## form submitted")
    event.preventDefault()
    return submitted = true
  });

  let userinputsCheck =  document.querySelector(".userinputs")
  userinputsCheck && userinputsCheck.addEventListener("change", (event) => {
    console.log("######## userinput changed")
    $(".ib-cloud-upload").addClass("ib-cloud-upload-filled alert-color")
    $(".ib-cloud-upload").removeClass("ib-cloud-upload")
    return userinput = true
  }, { once: true })

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
    }
  }, { once: true })

  return userinput
}

export function saveFormAlert() {
  $(".ib-cloud-upload").addClass("ib-cloud-upload-filled alert-color")
  $(".ib-cloud-upload").removeClass("ib-cloud-upload")
}

