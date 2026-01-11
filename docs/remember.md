
## Importmaps

    ./bin/importmap json # see whats imported.

## Clear cache / assets

    RAILS_ENV=production rails tmp:cache:clear
    RAILS_ENV=production rails assets:clobber
    RAILS_ENV=production rails assets:precompile

    chown -R puma:www-data tmp/cache/assets/
    chown -R puma:www-data public/assets/

## Solid Queue

To view failed jobs:

    SolidQueue::FailedExecution.all
    SolidQueue::FailedExecution.count

If you want to delete them one by one (with more control):

    SolidQueue::FailedExecution.first(100).each(&:destroy)

To run the jobs immediately (synchronously):

    BirthdateMailJob.perform_now
    EventMailJob.perform_now
