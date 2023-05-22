console.log("######## TEST checkout on load");

//document.addEventListener("turbo:load", () => console.log("foo"));
document.addEventListener("turbo:load", () => console.log("1 Turbo event load"));
//document.addEventListener("turbo:before-visite", () => console.log("2 Turbo event before-visite"));
//document.addEventListener("turbo:before-render", () => console.log("3 Turbo event before-render"));

document.addEventListener("turbo:load", () => $("#name_search").focus());

function myFunction() {
  document.getElementById("demo").innerHTML = "Hello my";
}

let helloFunction = () => document.getElementById("demo").innerHTML = "Hello World";
let setFocus = () => $("#name_search").focus();

window.$("#name_search").focus();
window.myFunction = myFunction;
window.helloFunction = helloFunction;
window.setFocus = setFocus;

