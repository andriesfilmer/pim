# lib/tasks/event_mail.rake

# Example usage: rails event:mail
#
# Create a crontab that runs each our.
# 0 * * * * /bin/bash -l -c 'cd /var/www/pim-rails && RAILS_ENV=production rails event:mail'

# Debug, log sql in console
#ActiveRecord::Base.logger = Logger.new(STDOUT)

namespace :event do
  desc "Send a mail one day before a event occurs"
  task :mail => :environment do |t, args|
    #events = Event.where("start >= NOW() + INTERVAL 1 DAY AND start <= NOW() + INTERVAL 1 DAY + INTERVAL 1 HOUR");  # mysql
    events = Event.where("start >= STRFTIME('%Y-%m-%d %H:%M', 'now', '+1 day') AND start <= STRFTIME('%Y-%m-%d %H:%M', 'now', '+1 day', '+1 hour')") # sqlite
    events.each do | event |
      user = User.select(:email).find event.user_id
      Time.zone = event.tz
      #puts "#{event.title} - #{event.start} - #{event.end}, to: #{user.email}"
      BaseMailer.with(to: user.email, event: event).event_mail.deliver
    end
  end
end

