
Migration info from old pim to new pim.

## Mysql

    mysql pim < db/passkey.sql

    LOAD DATA LOCAL INFILE '/home/andries/keepass.csv'
    INTO TABLE passkeys
    FIELDS TERMINATED BY ','
    ENCLOSED BY '"'
    LINES TERMINATED BY '\n'
    IGNORE 1 ROWS
    (title, username, password, url, @notes, @updated_at, @created_at)
    SET notes = REPLACE(@notes, '\\n', '\n'), updated_at = SUBSTRING(@updated_at, 1,16), created_at = SUBSTRING(@created_at, 1,16) ;
    update passkeys set user_id=1;

    rails c -> Passkey.encryptPasskeyUp

# Devise migration

    rails db:migrate

    alter table users add name varchar(255) default null after id;
    insert into users (id,name,email,created_at,updated_at) select id,name,email,now(),now() from user;

    update events set created = updated where created = '0000-00-00 00:00:00';
    update events set updated = created where updated = '0000-00-00 00:00:00';
    update events SET created=REPLACE(created,'00 00:00:00','01 00:00:00') WHERE created like '%-00 00:00:00';
    alter table events add tags varchar(255) default null after className;
    alter table eventversions add tags varchar(255) default null after className;

    update contacts set created = updated where created = '0000-00-00 00:00:00';
    alter table contacts add tags varchar(255) default null after notes;
    alter table contactversions add tags varchar(255) default null after notes;

    alter table posts drop column mongo_id;
    alter table posts drop column description;
    alter table postversions drop column description;
    alter table posts change type type varchar(20);
    update posts set public = '1' where public = 'true';
    update posts set public = '0' where public = 'false' or public is null or public = '';
    update posts set type='post' where type='article';
    update posts set type='task' where type='todo';
    alter table posts change public public tinyint(1);

    ALTER TABLE postversions change id id INT PRIMARY KEY AUTO_INCREMENT;

    ALTER TABLE passkeys ADD COLUMN twofa boolean DEFAULT false after password;
    ALTER TABLE passkeyversions ADD COLUMN twofa boolean DEFAULT false after password;
    #UPDATE passkeys SET created_at = NOW(), updated_at = NOW();

### xversions -> x_versions

find app/ | grep -i versions

mv app/models/contactversion.rb app/models/contact_version.rb
mv app/models/eventversion.rb app/models/event_version.rb
mv app/models/postversion.rb app/models/post_version.rb
mv app/models/passkeyversion.rb app/models/passkey_version.rb
mv app/controllers/postversions_controller.rb app/controllers/post_versions_controller.rb
mv app/controllers/contactversions_controller.rb app/controllers/contact_versions_controller.rb
mv app/controllers/passkeyversions_controller.rb app/controllers/passkey_versions_controller.rb
mv app/controllers/eventversions_controller.rb app/controllers/event_versions_controller.rb
mv app/views/eventversions app/views/event_versions
mv app/views/passkeyversions app/views/passkey_versions
mv app/views/postversions app/views/post_versions
mv app/views/contactversions app/views/contact_versions

find app -type f | xargs perl -pi -e 's/Contactversion/ContactVersion/g'
find app -type f | xargs perl -pi -e 's/contactversion/contact_version/g'
find app -type f | xargs perl -pi -e 's/Eventversion/EventVersion/g'
find app -type f | xargs perl -pi -e 's/eventversion/event_version/g'
find app -type f | xargs perl -pi -e 's/Postversion/PostVersion/g'
find app -type f | xargs perl -pi -e 's/postversion/post_version/g'
find app -type f | xargs perl -pi -e 's/Passkeyversion/PasskeyVersion/g'
find app -type f | xargs perl -pi -e 's/passkeyversion/passkey_version/g'

### Todo after old pim offline

    # breaking changes with old pim version
    #alter table posts change type category varchar(20);
    #alter table postversions change type category varchar(20);
    # remove -> self.inheritance_column = 'zoink'
    # remove -> alias_attribute :category, :type

    alter table events change column description notes;
    alter table posts change type category varchar(255);
    alter table posts change tags tags varchar(255);
    alter table postversions change type category varchar(20);

    update posts set tags = REGEXP_REPLACE(tags, '\\[|\\]|"|#', '');
    rename table contactversions to contact_versions;
    rename table eventversions to event_versions;
    rename table postversions to post_versions;
    rename table posts to notes;

**REMOVE** alias_attribute(s) from models;
**REMOVE** self.table_name(s) from models;

