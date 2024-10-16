# lib/tasks/birthdate_mail.rake

# Example usage: rails birthdate:mail
#
# Create a crontab that runs each 5 minutes. For example:
# 5 * * * * /bin/bash -l -c 'cd /var/www/pim-rails && RAILS_ENV=production rails birthdate:mail'

namespace :birthdate do
  desc 'Send a mail one day before birthdate'
  task mail: :environment do |_t, _args|
    # persons = Contact.where("DATE_FORMAT(birthdate,'%m-%d') = DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%m-%d')") # mysql
    contacts = Contact.where("STRFTIME('%m-%d', birthdate) = STRFTIME('%m-%d', 'now', '-1 day')") # sqlite
    contacts.each do |contact|
      user = User.select(:email).find contact.user_id
      # puts "Birthdate #{contact.name} on #{contact.birthdate}, age: #{contact.age(contact.birthdate)}, to: #{user.email}"
      BaseMailer.with(to: user.email, contact: contact).birthdate_mail.deliver
    end
  end
end
