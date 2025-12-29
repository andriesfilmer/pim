## Install

    git clone git@github.com:andriesfilmer/pim-rails.git
    bundle install
    rails credentials:edit   # Read remarks
    rails db:encryption:init # Read remarks
    rails db:schema:load
    rails s

## Remarks

Running `rails credentials:edit` will add config/master.key to store the encryption key
Save this key in a password manager.

Running `db:encryption:init` will generate a random key set for encrypting values in the database.

    active_record_encryption:
      primary_key: wltv4IRH33X4ih3oiRpFgjLfpsveb29T
      deterministic_key: hOwj1GvGSJZzaSS2JKElOxnWYadquCfQ
      key_derivation_salt: QvqZbnHwNQWdcUXcvbQXanYseYa0cXrj

Add this entry to the credentials of the target environment `config/credentials.yml.enc`.
Run `rails credentials:edit` again and past these keys into this file.
More info about encryption: <https://guides.rubyonrails.org/active_record_encryption.html>

**If you lose these keys, no one, including you, can access anything encrypted with it.**

## Sqlite vs Mysql/MariaDb

This app use Sqlite as default.

You can set a crontab to backup sqlite with the crontab `lib/sqlite_vacuum_copy.sh`

Change the file `/config/database.yml` to your preferences.

If you choose Mysql/MaariaDb as backend database. Comment en Uncomment some lines.
Because I don't know how to do this with ActiveRecord interface. If possible?

* app/controllers/contacts_controller.rb -> line 9
* lib/tasks/birthdate_mail.rake -> line 11,12
* lib/tasks/event_mail.rake -> line 14,15

## Symbolic link uploads

    ln -s /mnt/path/to/pim uploads
    chown puma:www-data uploads

## Solid Queue

### Create queue database

    rails db:create:queue
    rails db:schema:load:queue DISABLE_DATABASE_ENVIRONMENT_CHECK=1

### Check tables exists

    sqlite3 db/queue.sqlite3 ".tables"

### Enable service
````
ln -s /var/www/pim-rails/config/solid_queue.service  /etc/systemd/system/solid_queue.service
systemctl daemon-reload
systemctl enable solid_queue.service
systemctl start solid_queue.service
systemctl status solid_queue.service
````
