# Ruby on Rails - PIM (Personal Information Management)

Rails 7.0.4.3

## Install

    git clone git@github.com:andriesfilmer/pim-rails.git
    bundle install
    npm install

Start the server

    rails assets:clobber # if previous builds
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
* [icons](https://fonts.google.com/icons)

## In depth

* [Tag builder turbo](https://github.com/hotwired/turbo-rails/blob/main/app/models/turbo/streams/tag_builder.rb)

# Temporary notes

## Importmaps

    ./bin/importmap json # see whats imported.


## Mysql

    rails db:migrate
    insert into users (id,email,created_at,updated_at) select id,email,now(),now() from user;

    alter table events change created created_at datetime;
    alter table events change updated updated_at datetime;
    update events set created_at = updated_at where created_at = '0000-00-00 00:00:00';
    alter table eventversions change created created_at datetime;

    alter table contacts change created created_at datetime;
    alter table contacts change updated updated_at datetime;
    update contacts set created_at = updated_at where created_at = '0000-00-00 00:00:00';
    alter table contactversions change created created_at datetime;

    alter table posts change created created_at datetime;
    alter table posts change updated updated_at datetime;
    alter table posts change type kind enum('article','hobby','note','todo','other');
    alter table postversions change type kind varchar(20);
    alter table postversions change created created_at datetime;
    alter table postversions change id id int(11) primary;
    ALTER TABLE postversions drop PRIMARY KEY;
    ALTER TABLE postversions change id id INT PRIMARY KEY AUTO_INCREMENT;

    UPDATE events SET created_at=REPLACE(created_at,'00 00:00:00','01 00:00:00') WHERE created_at like '%-00 00:00:00';


