// Add arrow back (content via css)
elArrow = document.getElementById("add-back-arrow");
if (elArrow != null ) {
  const span = document.createElement("span");
  span.className = "back-arrow show-for-small-only";
  elArrow.prepend(span);
  elArrow.addEventListener("click", () => {
    return window.history.back();
  });
}
