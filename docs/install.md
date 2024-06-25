## Install

    git clone git@github.com:andriesfilmer/pim-rails.git
    bundle install
    rails db:schema:load
    rails s

## Config

Create a `/config/master.key` file.

    rails credentials:edit

It also creates a `/config/credentials.yml.enc` file for active_record_encryption.


## Sqlite vs Mysql/MariaDb

This app use Sqlite as default.

### database.yml

Change the file `/config/database.yml` to your preferences.

If you choose Mysql/MaariaDb as backend database. Comment en Uncomment some lines.
Because I don't know how to do this with ActiveRecord interface. If possible?

* app/controllers/contacts_controller.rb -> line 9
* lib/tasks/birthdate_mail.rake -> line 12,13
* lib/tasks/event_mail.rake -> line 14,15
