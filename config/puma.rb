port ENV.fetch("PORT") { 3000 }

app_dir = File.expand_path("../..", __FILE__)

# Set up socket location
bind "unix://#{app_dir}/tmp/puma.sock"

# Specifies the `environment` that Puma will run in.
environment ENV.fetch("RAILS_ENV") { "production" }

workers 2
preload_app!

pidfile "#{app_dir}/tmp/puma.pid"
state_path "#{app_dir}/tmp/puma.state"
