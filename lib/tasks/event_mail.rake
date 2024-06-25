# lib/tasks/event_mail.rake

# Create a crontab that runs each 5 minutes.
# */5 * * * * /bin/bash -l -c 'cd /var/www/pim-rails && rails event:mail'
#
# Example usage: rails event:mail

# Debug, log sql on console
#ActiveRecord::Base.logger = Logger.new(STDOUT)

namespace :event do
  desc "Send a mail one day before a event"
  task :mail => :environment do |t, args|
    #events = Event.where("start >= NOW() + INTERVAL 1 DAY AND start <= NOW() + INTERVAL 1 DAY + INTERVAL 5 MINUTE");  # mysql
    events = Event.where("start >= STRFTIME('%Y-%m-%d %H:%M', 'now', '+1 day') AND start <= STRFTIME('%Y-%m-%d %H:%M', 'now', '+1 day', '+5 minutes')") # sqlite
    events.each do | event |
      Time.zone = event.tz
      puts "#{event.title} - #{event.start} - #{event.end}"
      BaseMailer.with(to: 'andries@filmer.nl', event: event).event_mail.deliver
    end
  end
end

