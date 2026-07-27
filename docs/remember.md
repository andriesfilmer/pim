
## Importmaps

    ./bin/importmap json # see whats imported.

## Clear cache / assets

    RAILS_ENV=production rails tmp:cache:clear
    RAILS_ENV=production rails assets:clobber
    RAILS_ENV=production rails assets:precompile

    chown -R puma:www-data tmp/cache/assets/
    chown -R puma:www-data public/assets/

## Mail check

    RAILS_ENV=production rails c
    e = Event.where(user_id: 1).last; Time.zone = e.tz; BaseMailer.with(to: User.find(e.user_id).email, event: e).event_mail.deliver

## Solid Queue

To view failed jobs:

    SolidQueue::FailedExecution.all
    SolidQueue::FailedExecution.count

If you want to delete them one by one (with more control):

    SolidQueue::FailedExecution.first(100).each(&:destroy)

To run the jobs immediately (synchronously):

    BirthdateMailJob.perform_now
    EventMailJob.perform_now

## Sqlite

When `rails server` starts and give a error: `table_structure': Could not find table 'solid_queue_processes'.

    sqlite3 db/development.sqlite3 "UPDATE ar_internal_metadata SET value='development' WHERE key='environment';"

