# Fix datetime UTC time in localtime when sharing a event.

## update DB


    update events set tz = 'Europe/Amsterdam' where tz= 'Europe/Paris';
    update events set start = concat(substr(start,-19,11),'00:00:00') where allDay=1 and tz='Europe/Amsterdam';
    update events set end = concat(substr(end,-19,11),'00:00:00') where allDay=1 and tz='Europe/Amsterdam';

    update events set start= addtime(start, '1:0') where allDay = 0 and date(start) = date(addtime(start, '1:0'));
    5 x -> update events set end= addtime(end, '1:0') where allDay = 0 and date(end) = date(addtime(end, '1:0'));

    select title,className,tz,start,addtime(start, '1:0'),end,allDay from events where allDay = 0 and date(start) < date(addtime(start, '1:0'));
    select title,className,tz,start,addtime(end, '1:0'),end,allDay from events where allDay = 0 and date(end) < date(addtime(end, '1:0'));

# Need to fix
- Feedback from api if token invalid. Now we show only '.... from localhost'
- jwt token expire feedback must be better from the api

## General
- Infinite Scroll for lists - https://sroze.github.io/ngInfiniteScroll/
- Future wish to translate PIM - https://github.com/angular-translate/angular-translate

## Contact
- Photo crop with rotation.

# Issues
- Upload contact photo on ipad does not work correct.
  https://github.com/fengyuanchen/cropper/issues/294

# Other longterm wishes

- Sync-it https://www.npmjs.com/package/sync-it

