# Ruby on Rails - PIM (Personal Information Management)

Rails 7.0.4.3

## Install

    git clone git@github.com:andriesfilmer/pim-rails.git
    bundle install
    npm install

Start the server

    rails s

## Private PIM with:

* Register/Login/Logout users - With reset password.
* Posts/Notes/Articles
* Personal calendar (Appointments, Memos), Timezone awarenss.
* Contacts (Add unlimited Phonenumbers, Companies, Relations, E-mailaddresses, Websites, Addresses and notes)
* Bookmarks (With tags and notes)

Take a look on <https://pim.filmer.nl>

## Resources

* [Working with javascript in rails](https://guides.rubyonrails.org/working_with_javascript_in_rails.html)
* [Turbo handbook](https://turbo.hotwired.dev/handbook/introduction)
* [The Turbo Rails Tutorial](https://www.hotrails.dev/)
* [Flash messages with Hotwire](https://www.hotrails.dev/turbo-rails/flash-messages-hotwire)
* [Example turbo todos](https://github.com/tf-jlemasters/turbo-todos)

## In depth

* [Tag builder turbo](https://github.com/hotwired/turbo-rails/blob/main/app/models/turbo/streams/tag_builder.rb)

# Temporary notes

## Mysql

    alter table contacts change created created_at datetime;
    alter table contactversions change created created_at datetime;
    alter table contacts change updated updated_at datetime;
    update contacts set created_at = updated_at where created_at = '0000-00-00 00:00:00';


