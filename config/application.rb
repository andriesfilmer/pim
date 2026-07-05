require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Pim
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    #config.load_defaults 8.0

    # This option is meant to be used during transition periods
    config.active_record.encryption.support_unencrypted_data = true

    # load_defaults is off, so the SameSite default (:lax) is not applied and
    # the session cookie ships with no SameSite attribute. Set it explicitly:
    # SameSite=Lax stops the cookie being sent on cross-site POSTs, which
    # together with protect_from_forgery closes the CSRF hole.
    config.action_dispatch.cookies_same_site_protection = :lax

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Default datetime is saved to database in UTC.
    # But all history datetime is saved to 'Europe/Amsterdam'.
    # Later update all entries to UTC and remove this config.time_zone.
    #config.time_zone = 'Europe/Amsterdam'
    #config.active_record.default_timezone = :local
  end
end
