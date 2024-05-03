# Pin npm packages by running ./bin/importmap

pin "application", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true
pin "jquery", to: "jquery-3.6.4.min.js" # vendor/javascript
pin "marked", to: "marked-5.0.4.js" # vendor/javascript
pin "marked-gfm-heading-id", to: "marked-gfm-heading-id.js" # vendor/javascript
#pin "moment", to: "moment/src/moment.js" # vendor/javascript
pin "components"
pin_all_from "app/javascript/controllers", under: "controllers"
