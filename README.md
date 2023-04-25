# README

    git clone git@github.com:andriesfilmer/pim-rails.git

# New rail app

Rails 7.0.4.3

    rails new pim-app

## importmap

    rails importmap:install
`
Add Importmap include tags in application layout
      insert  app/views/layouts/application.html.erb
Create application.js module as entrypoint
      create  app/javascript/application.js
Use vendor/javascript for downloaded pins
      create  vendor/javascript
Ensure JavaScript files are in the Sprocket manifest
      append  app/assets/config/manifest.js
Configure importmap paths in config/importmap.rb
      create  config/importmap.rb
Copying binstub
      create  bin/importmap

## Turbo

    rails turbo:install


Pin turbo

    bin/importmap pin @hotwired/turbo-rails
    bin/importmap pin application



## Resources

* [Working with javascript in rails](https://guides.rubyonrails.org/working_with_javascript_in_rails.html)
