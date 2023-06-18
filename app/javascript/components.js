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
