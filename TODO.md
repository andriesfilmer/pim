# Need to fix
- Fix datetime UTC time in localtime when sharing a event.

# Wishlist

## General 
- jwt token expire feedback must be better from the api
- Infinite Scroll for lists - https://sroze.github.io/ngInfiniteScroll/
- Future wish to translate PIM - https://github.com/angular-translate/angular-translate

## Contact 
- Photo crop with rotation.

# Issues
- PDF Css body -> font size %60 works only in development?!
- Upload contact photo on ipad does not work correct.
  https://github.com/fengyuanchen/cropper/issues/294
- Share PDF with bullet list does not work correct with <ul><li>

# Other longterm wishes

- Sync-it https://www.npmjs.com/package/sync-it

CREATE TABLE `eventversions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `org_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL DEFAULT 0,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `start` datetime DEFAULT NULL,
  `end` datetime DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `className` varchar(1024) DEFAULT 'appointment',
  `allDay` tinyint(1) DEFAULT 1,
  `tz` varchar(100) DEFAULT NULL,
  `created` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `org_id` (`org_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2420 DEFAULT CHARSET=utf8mb4;

CREATE TABLE `contactversions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `org_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL DEFAULT 0,
  `contact_id` varchar(100) DEFAULT NULL,
  `phones` varchar(1024) DEFAULT '[]',
  `emails` varchar(1024) DEFAULT '[]',
  `addresses` varchar(1024) DEFAULT '[]',
  `companies` varchar(1024) DEFAULT '[]',
  `websites` varchar(1024) DEFAULT '[]',
  `name` varchar(100) NOT NULL,
  `birthdate` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `phones_fax` varchar(50) DEFAULT NULL,
  `starred` tinyint(1) DEFAULT 0,
  `photo` varchar(100) DEFAULT NULL,
  `times_read` int(11) DEFAULT 0,
  `last_read` datetime DEFAULT NULL,
  `created` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `org_id` (`org_id`)
) ENGINE=MyISAM AUTO_INCREMENT=557 DEFAULT CHARSET=utf8mb4;

update contacts set companies = REGEXP_REPLACE(companies, '"name":', '\"value\":');
update contacts set companies = REGEXP_REPLACE(companies, '"title":', '\"type\":');
