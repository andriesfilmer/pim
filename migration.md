
Migration info from old pim to new pim.

## Mysql

    mysql pim < db/passkey.sql

    LOAD DATA LOCAL INFILE '/home/andries/Nextcloud/Private/Backup/Keepass/keepass.csv'
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
    UPDATE events SET created_at=REPLACE(created_at,'00 00:00:00','01 00:00:00') WHERE created_at like '%-00 00:00:00';
    alter table events add tags varchar(255) default null after className;
    alter table eventversions add tags varchar(255) default null after className;

    update contacts set created_at = updated_at where created_at = '0000-00-00 00:00:00';
    alter table contacts add tags varchar(255) default null after notes;
    alter table contactversions add tags varchar(255) default null after notes;

    alter table posts drop column mongo_id;
    alter table posts drop column description;
    update posts set public = '1' where public = 'true';
    update posts set public = '0' where public = 'false' or public is null or public = '';
    alter table posts change public public tinyint(1);

    # breaking changes with old pim version
    alter table posts change type category varchar(20);
    alter table postversions change type category varchar(20);
    # Alternative does not work :(
    alter table posts add category varchar(255) after type;
    update posts set category=type;

    #ALTER TABLE postversions drop PRIMARY KEY;
    ALTER TABLE postversions change id id INT PRIMARY KEY AUTO_INCREMENT;


### Todo

After old pim offline

    alter table events change column description notes;
    alter table posts change type category varchar(255);
    alter table posts change tags tags varchar(255);
    alter table postversions change type category varchar(20);

    update posts set tags = REGEXP_REPLACE(tags, '\\[|\\]|"|#', '');
    rename table posts to notes;

**REMOVE** alias_attribute(s) from models;
