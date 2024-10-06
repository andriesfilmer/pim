import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

// Set on full reload, if prefers color scheme dark or light.
if (window.location.protocol != "https:") {
  // Used in development mode.
  document.body.className = 'red-theme';
  localStorage.setItem('theme', 'red-theme');
} else if (localStorage.getItem('theme') !== null) {
  // Theme is set by user in localStorage.
  document.body.classList.add(localStorage.getItem('theme'));
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  // User prefers dark theme.
  document.body.className = '';
  document.body.classList.add('dark-theme');
  localStorage.setItem('theme', 'dark-theme');
} else {
  // Default light theme.
  document.body.className = '';
  document.body.classList.add('light-theme');
  localStorage.setItem('theme', 'light-theme');
}

export { application }
