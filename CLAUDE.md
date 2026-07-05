# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Self-hosted Personal Information Manager (PIM). Rails 8.1 / Ruby 3.3, SQLite3, Hotwire stack (Turbo + Stimulus via importmap-rails, no JS bundler), dartsass-rails for SCSS, Devise for auth, Solid Queue for background jobs. No test suite is configured.

## Commands

```bash
bin/dev                  # Start everything: Rails server (port 3000), dartsass:watch, Solid Queue worker
bin/rails server -p 3000 # Rails server only
bin/jobs                 # Solid Queue worker only
bin/rails dartsass:watch # SCSS watcher only
bin/rails db:setup       # Create DB, load schema, seed
bin/rails db:schema:load:queue  # Fix "Could not find table 'solid_queue_processes'"
```

Important:
- `config/puma.rb` defaults `RAILS_ENV` to **production** — always pass/export `RAILS_ENV=development` when it matters, or use `bin/rails server` (which sets it).
- Never run `assets:precompile` in development. JS is served just-in-time from `app/javascript/` via importmap (changes apply on page reload, no build step). SCSS needs the dartsass watcher or `bin/rails dartsass:build`.
- Two SQLite databases per environment: `primary` and `queue` (see `config/database.yml`).

## Architecture

### Resources and version history

Four core resources: **Event** (calendar), **Contact**, **Post** (notes), **Passkey** (password manager). Each follows the same pattern:

- Model + `*Version` model (e.g. `Post` / `PostVersion`) for history tracking. Version rows are plain copies created by the controller's private `add_version` method after create/update — no gem, no callbacks.
- Controller + `*_versions_controller.rb` with `restore` and `compare` actions (diffs rendered with `diffy`). Custom routes like `post postrestore` and `get post_versions/compare` sit alongside standard `resources` routes in `config/routes.rb`.
- A Stimulus controller per resource in `app/javascript/controllers/` (e.g. `post_controller.js`), plus shared helpers in `app/javascript/components.js` (tooltip, saveFormAlert, showTags, compareVersions).

All queries scope by `current_user.id` manually in controllers (no CanCan/Pundit). `ApplicationController` enforces `authenticate_user!` except for `about`/`welcome`.

### Legacy schema quirks (MongoDB migration heritage)

Models rely heavily on `alias_attribute` because column names predate Rails conventions:
- `created`/`updated` instead of `created_at`/`updated_at` (Event, Contact, Post)
- Event: `start_date`/`start_time` → `start`, `notes` → `description`, `category` → `className` (FullCalendar naming)
- Version tables have non-standard names (e.g. `postversions`) and `self.inheritance_column` overridden because a `type` column exists
- Some tables carry a `mongo_id` column — excluded from backups

### Contacts: type/value JSON pattern

Contacts store phones, emails, addresses, companies, websites as **JSON strings in single DB columns** (e.g. `[{"type":"Mobile","value":"+31..."}]`). The edit form uses container divs (`<div id="phones">`) holding visible inputs tagged `data-tojson`, synced by JS into hidden fields (`contact[phones]`) before submit via `prepareTypeValues()` in the contact Stimulus controller.

### Passkeys (password manager)

`Passkey` uses Active Record encryption (`encrypts :username, :password, :notes`) — requires the Rails master key. `PasskeyShare` enables sharing credentials between users.

### Background jobs / mail

Solid Queue with recurring jobs defined in `config/recurring.yml` (production only): `BirthdateMailJob` daily, `EventMailJob` hourly. Mailers in `app/mailers/base_mailer.rb`. SMTP configured per environment.

### Offline / PWA

Service worker at `public/service-worker.js` + IndexedDB helper `public/offline-db.js`. The service worker MUST stay **network-first for all requests**: Turbo Drive fetches with `mode: 'same-origin'` (not `'navigate'`), so any cache-first branch for non-navigation requests serves stale HTML/JS to Turbo and breaks the app. Per-user offline toggle stored on `User#offline_data` (`POST /offline_data`).

### Frontend gotchas

- `config.load_defaults` is commented out, so `form_with` does **not** auto-generate DOM ids — form fields need explicit `id:` for any `getElementById`-based JS.
- Prefer lookups by name (`document.querySelector('input[name="contact[phones]"]')`) or container div + `[data-tojson]` over id-prefix selectors.
- jQuery delegated handlers (`$(document).on(...)`) in Stimulus controllers are never removed (no `disconnect()`), so they accumulate across Turbo navigations — be careful adding more.
- `_secondary_menu.html.erb` creates a nested `data-controller="contact"` element, so `connect()` runs twice on contact pages.

### File uploads

Post attachments are written directly to `public/uploads/<user_id>/posts/<post_id>/` (no Active Storage for these). Filenames pass through `ApplicationController#sanitize_filename`.

### Data backup

`GET /backup` (`BaseController#backup`) exports selected resources to an xlsx workbook via `caxlsx`, one sheet per resource.
