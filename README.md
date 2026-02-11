# PIM - Personal Information Manager

A self-hosted personal information manager built with Ruby on Rails.

## Features

* **Posts/Notes** - Markdown support, file attachments, version history, table of contents
* **Calendar** - Events with timezone awareness, email reminders, FullCalendar integration
* **Contacts** - Multiple phones/emails/addresses per contact, birthday reminders, starred favorites
* **Password Manager** - Encrypted credentials (AES-256-GCM), secure sharing between users
* **Version History** - Track changes and restore previous versions for all data types
* **PWA Support** - Installable as a Progressive Web App

## Demo

Take a look at <https://pim.filmer.nl>

## Requirements

* Ruby 3.2+
* Rails 8.1+
* SQLite 3

## Installation

See [docs/install.md](docs/install.md) for detailed installation instructions.

### Quick Start

```bash
git clone https://github.com/andriesfilmer/pim.git
cd pim
bundle install
bin/rails db:setup
bin/rails server
```

## Configuration

### Master Key

The master key is required to encrypt/decrypt passkey credentials. Generate one if not present:

```bash
bin/rails credentials:edit
```

### Email (SMTP)

Configure SMTP settings in `config/environments/production.rb` for:
- Password reset emails
- Email confirmation
- Birthday and event reminders

### Disabling Registration

For single-user mode, remove `:registerable` from the User model in `app/models/user.rb` after creating your account.

## Production Deployment

1. Install dependencies and compile assets:
   ```bash
   bundle install
   bin/rails assets:precompile
   ```

2. Setup database:
   ```bash
   bin/rails db:setup
   ```

3. Ensure `config/master.key` is present on the server

4. Run behind a reverse proxy (nginx/Apache) with HTTPS

## Security

This application includes several security measures:

* **Encrypted credentials** - Passkey usernames, passwords, and notes are encrypted using Rails Active Record Encryption
* **Content Security Policy** - Strict CSP headers enabled
* **XSS Protection** - Markdown output sanitized with DOMPurify
* **Rate Limiting** - Login, password reset, and search endpoints are rate-limited (rack-attack)
* **CSRF Protection** - All forms protected, sign-out requires DELETE method
* **User Isolation** - All data is scoped to the authenticated user
* **Secure Cookies** - HttpOnly and Secure flags enabled

### Security Considerations

* **Database encryption at rest** - The SQLite database file itself is not encrypted. Consider using full-disk encryption or an encrypted filesystem for the server.
* **Session timeout** - Sessions do not expire on idle (remember me is set to 1 year). For shared devices, users should log out manually.
* **Master key** - Keep `config/master.key` secure and never commit it to version control. Without it, encrypted passkeys cannot be decrypted.
* **Backups** - When backing up, include both the database AND `config/master.key`.
* **Offline mode** - When offline mode is enabled the data is unencrypted in IndexedDB!

## Backups

Important files to backup:

* `db/pim.sqlite3` - Main database
* `config/master.key` - Required to decrypt passkey credentials
* `public/uploads/` - User uploaded files
* `storage/` - Additional file storage

## License

[MIT License](LICENSE)

## Author

Created by [Andries Filmer](https://andries.filmer.nl)
