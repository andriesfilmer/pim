source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.2.3"

gem "mysql2"
gem "sqlite3"
gem "rails", "~> 7.2.1"
gem "sprockets-rails"
gem "terser" # a fork based on uglifier
gem "puma", "~> 6.0"
gem "importmap-rails"
gem "turbo-rails"
gem "stimulus-rails"
gem "jbuilder" # Simple DSL for declaring JSON structures

gem "devise"
gem "pretty_inspect"
gem "diffy"

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
# gem "bcrypt", "~> 3.1.7"

# Reduces boot times through caching; required in config/boot.rb
#gem "bootsnap", require: false

gem "sassc-rails"

# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
# gem "image_processing", "~> 1.2"

group :development do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri mingw x64_mingw ]

  # Use console on exceptions pages [https://github.com/rails/web-console]
  #gem "web-console"

  # Add speed badges [https://github.com/MiniProfiler/rack-mini-profiler]
  #gem "rack-mini-profiler"

  # Speed up commands on slow machines / big apps [https://github.com/rails/spring]
  # gem "spring"

  # dump sql -> mysql -> sqlite
  # rake db:data:dump   ->   Dump contents of Rails database to db/data.yml
  # rake db:data:load   ->   Load contents of db/data.yml into the database

  gem 'yaml_db'
end

