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
    $("#cloud-upload").addClass("cloud-upload-filled")
    $("#cloud-upload").removeClass("cloud-upload")
    $("#cloud-upload").addClass("filter-red")
}

export function showTags(model) {

  if (document.getElementById("tagsContainer")) {
    let input = document.getElementById(model)
    writeTags(input.value);

    input.addEventListener('keyup', () => {
      writeTags(input.value);
    });

    function writeTags(value) {
      // Split the string into an array using ', ' as the delimiter
      let tagsArray = value.split(',');

      // Select the HTML element where you want to display the tags
      let tagsContainer = document.getElementById("tagsContainer");

      // Clear any existing content in the container
      tagsContainer.innerHTML = "";

      // Loop through the array and create a span element for each tag
      tagsArray.forEach(function(tag) {
          let tagSpan = document.createElement("span");
          tagSpan.textContent = tag.trim();
          tagsContainer.appendChild(tagSpan);
      });
    }
  }
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

export function copyContent(content) {
  navigator.clipboard.writeText(content).then(() => {
    console.log('Content copied to clipboard successfully!');
  }).catch(err => {
    console.error('Failed to copy content: ', err);
  });
}

export  function genPassword() {
  const alpha = 'abcdefghijklmnopqrstuvwxyz';
  const calpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const num = '1234567890';
  const specials = '!@#$%^&*_';
  const options = [alpha, alpha, alpha, alpha, alpha, calpha, calpha, calpha, num, num, num, specials];
  let opt, choose;
  let pass = "";
  for ( let i = 0; i < 12; i++ ) {
    opt = Math.floor(Math.random() * options.length);
    choose = Math.floor(Math.random() * (options[opt].length));
    pass = pass + options[opt][choose];
    options.splice(opt, 1);
  }
  return pass
}

export function markdownToc(data) {

 // Inspiration from Eugene Datsky
 // https://raw.githubusercontent.com/princed/table-of-contents-preprocessor/master/toc.js

  var indents = [""];
  for(var i = 1; i < 10; i++) {
      indents.push(indents[i-1] + " ");
  }

  if (data !== undefined) {

    var lines = data.trimRight().split('\n');
    var titles = [];
    var toc = [];
    var depths = [];
    var minDepth = 1000000;

    for(var j = 0; j < lines.length; j++) {
      var line = lines[j];
      var m = line.match(/^(#+)(.*)$/);
      if (!m) continue;
      minDepth = Math.min(minDepth, m[1].length);
      depths.push(m[1].length);

      let title = m[2];
      let uri = title.trim().toLowerCase().replace(' ','-').replace(/[^-0-9a-z]/g, '');
      titles.push({title: title, uri: uri});
    }

    for(var k = 0; k < depths.length; k++) {
      depths[k] -= minDepth;
    }

    for(var l = 0; l < depths.length; l++) {
      toc.push(indents[depths[l]] + '- <a href="#' + titles[l].uri + '">' + titles[l].title + '</a>');
    }

    // Show TOC if we have more then 3 titles.
    if (titles.length <= 3) {
      return false;
    } else {
      return toc.join('\n');
    }
  }
}
