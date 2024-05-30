import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

// Set on full reload, if prefers color scheme dark or light.
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.className = '';
  document.body.classList.add('dark-theme');
  localStorage.setItem('theme', 'dark-theme');
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
  document.body.className = '';
  document.body.classList.add('light-theme');
  localStorage.setItem('theme', 'light-theme');
} else {
  document.body.className = 'red-theme';
  localStorage.setItem('theme', 'red-theme');
}

export { application }
