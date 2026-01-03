
## Importmaps

    ./bin/importmap json # see whats imported.

## Clear cache / assets

    RAILS_ENV=production rails tmp:cache:clear
    RAILS_ENV=production rails assets:clobber
    RAILS_ENV=production rails assets:precompile

    chown -R puma:www-data tmp/cache/assets/
    chown -R puma:www-data public/assets/

## Solid Queue



