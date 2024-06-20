# lib/tasks/birthdate_mail.rake

# Example usage: rails birthdate:mail

namespace :birthdate do
  desc "Send a mail one day before birthdate"
  task :mail => :environment do |t, args|

    #persons = Contact.where("DATE_FORMAT(birthdate,'%m-%d') = DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%m-%d')") # mysql
    persons = Contact.where("STRFTIME('%m-%d', birthdate) = STRFTIME('%m-%d', 'now', '+1 day')") # sqlite
    persons.each do | person |
      puts "Birthdate #{person.name} on #{person.birthdate}, age: #{person.age(person.birthdate)}"
    end
  end
end

