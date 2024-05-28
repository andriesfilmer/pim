port ENV.fetch("PORT") { 3000 }

#app_dir = File.expand_path("../..", __FILE__)
app_dir = "/var/www/pim-rails"

# Set up socket location
bind "unix://#{app_dir}/tmp/puma.sock"

# Specifies the `environment` that Puma will run in.
#
environment ENV.fetch("RAILS_ENV") { "production" }

preload_app!

pidfile "#{app_dir}/tmp/puma.pid"
state_path "#{app_dir}/tmp/puma.state"

# Logging
stdout_redirect "#{app_dir}/log/puma.stdout.log", "#{app_dir}/log/puma.stderr.log", true

