# lib/tasks/birthdate_mail.rake

# Example usage: rails birthdate:mail

namespace :birthdate do
  desc "Send a mail one day before birthdate"
  task :mail => :environment do |t, args|

    #persons = Contact.where("DATE_FORMAT(birthdate,'%m-%d') = DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%m-%d')") # mysql
    contacts = Contact.where("STRFTIME('%m-%d', birthdate) = STRFTIME('%m-%d', 'now', '+1 day')") # sqlite
    contacts.each do | contact |
      #puts "Birthdate #{contact.name} on #{contact.birthdate}, age: #{contact.age(contact.birthdate)}"
      BaseMailer.with(to: 'andries@filmer.nl', contact: contact).birthdate_mail.deliver
    end
  end
end

