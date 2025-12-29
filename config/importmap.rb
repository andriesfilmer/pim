# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true
pin "jquery", to: "jquery-3.7.1.esm.js" # vendor/javascript
pin "marked", to: "marked-14.1.4.esm.js" # vendor/javascript
pin "marked-gfm-heading-id", to: "marked-gfm-heading-id-4.1.0.js" # vendor/javascript
pin "github-slugger", to: "github-slugger.js" # vendor/javascript
#pin "moment", to: "moment/src/moment.js" # vendor/javascript
pin "components"
pin_all_from "app/javascript/controllers", under: "controllers"
