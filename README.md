# README

    git clone git@github.com:andriesfilmer/pim-rails.git

# New rail app

Rails 7.0.4.3

    rails new pim-app

## Turbo

    rails turbo:install

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

Pin turbo

    ./bin/importmap pin application
    ./bin/importmap pin @hotwired/turbo-rails
    ./bin/importmap pin jquery --download

## Mysql

    alter table contacts add column created_at datetime;
    alter table contacts add column updated_at datetime;

    create view contacts_prisma as select *, created as created_at, updated as updated_at from contacts;

## Resources

* [Working with javascript in rails](https://guides.rubyonrails.org/working_with_javascript_in_rails.html)
* [Turbo handbook](https://turbo.hotwired.dev/handbook/introduction)
* [The Turbo Rails Tutorial](https://www.hotrails.dev/)
* [Flash messages with Hotwire](https://www.hotrails.dev/turbo-rails/flash-messages-hotwire)
* [Example turbo todos](https://github.com/tf-jlemasters/turbo-todos)

## In depth
* [Tag builder turbo](https://github.com/hotwired/turbo-rails/blob/main/app/models/turbo/streams/tag_builder.rb)

