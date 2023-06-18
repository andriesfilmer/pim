import { Application } from "@hotwired/stimulus"
import { tooltip } from 'components'
tooltip()


const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

export { application }
