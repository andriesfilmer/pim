// https://www.freecodecamp.org/news/javascript-modules-a-beginner-s-guide-783f7d7a5fcc/
//
// Tooltip component
// -----------------

export function tooltip() {
    // Set all title values to data-tooltip values for tooltips.
    $("[data-tooltip]").each( function() {
      if (this.title !== '') {
        console.log("######## Tooltip title: " + this.title)
        $(this).attr('data-tooltip',this.title)
        this.title = ''
      }
    })
  //}

  // Set tooltip off/on
  $('[data-tooltip]').mouseover(function(e) {
    $(this).addClass('tooltip')
  })

  $('[data-tooltip]').mouseout(function(e) {
    $(this).removeClass('tooltip')
  })

  // On input elements with tab (keyboard) navigation set tooltip off/on
  $('[data-tooltip]').focusin(function(e) {
    $(this).addClass('tooltip')
  })

  $('[data-tooltip').focusout(function(e) {
    $(this).removeClass('tooltip')
  })

}

export function saveFormAlert() {
  $(":input").change(function(){ //triggers change in all input fields including text type
    $("#cloud-upload").attr("src","/assets/cloud-upload-filled.svg")
    $("#cloud-upload").addClass("icon alert")
  });
}

export function compareVersions() {

  // Two checkbox must be selected
  let required = $('.checkBoxClass')
  let compareIds = []

  // Bind change for all click and keyup for all checkboxes
  required.unbind("change keyup").bind("change keyup", function() {

    let flags = 0
    // Check every checkboxes in collection
    required.each(function() {
      if ($(this).is(":checked")) {
        compareIds.push(this.id)
        flags++
      }
    })

    // Set value in hidden input field.
    $("[name=ids]").val(compareIds)

    required.each(function() {
      if (flags == 2 && !$(this).is(":checked")) {
        $(this).css("display","none")
      } else {
        $(this).css("display","inline")
      }

    })

    // Number of nonempty (nonchecked) fields
    if (flags == 2) {
      $("#compare_btn").prop("disabled", false)
      $("#compare_btn").removeClass("disabled")
    } else {
      $("#compare_btn").prop("disabled", true)
      $("#compare_btn").addClass("disabled")
    }
  })

}

export function modalComponent() {
  $('[data-modal-open]').on('click', function() {
    let modal = event.target.dataset.modalOpen;
    $("#" + modal).addClass("show");
  });

  $('[data-modal-close]').on('click', function() {
    let modal = event.target.dataset.modalClose;
    $("#" + modal).removeClass("show");
  });
}
