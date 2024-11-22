# lib/tasks/ssh_login.rake
#
# We PermitRootLogin = NO on our servers
# We have a perl script (ssh-server.pl) that use Expect.
# It needs two arguments 1: pasword user, 2: password root.
# for fields: username and password to login via ssh-server.pl
#
# Usages: rails ssh:login["servername"]
#
# Debug, log sql in console
#ActiveRecord::Base.logger = Logger.new(STDOUT)

namespace :ssh do
  desc "ssh server by title search in passkeys."
  task :login, [:term] => :environment do |t, args|
    if args.term.nil?
      puts "Please provide a server term. Example: rails ssh:passkeys['servername']"
    else
      # Perform the search
      passkeys = Passkey.where("title LIKE ?", "%#{args.term}%")

      # If only one record found.
      if passkeys.one?
        print_decrypted_user_password(passkeys.take.id)
        exit
      end

      # If multiple records found.
      if passkeys.any?
        puts "Which server do you want to login?"
        passkeys.each do |passkey|
          puts "ID: #{passkey.id}, Server: #{passkey.title}"
        end

        puts "Give a ID and enter:"
        id = gets.chomp
        print_decrypted_user_password(id)

      else
        puts "No passkeys found with the title containing '#{args.term}'"
      end

    end
  end

  desc "Decrypt and display decrypted username and password"
  task :passkey, [:id] => :environment do |t, args|

    record_id = args.id       # Pass the ID of the record you want to decrypt

    if record_id.nil?
      puts "Please provide both a record ID with ID=<record_id> and a field name with FIELD=<field_name>"
      exit
    end

    record = Passkey.find_by(id: record_id)
    if record.nil?
      puts "Record not found"
      exit
    end

    puts "#{record.title.split[0]} #{record.username} #{record.password}"
  end

  def print_decrypted_user_password(id)
      Rake::Task["ssh:passkey"].invoke(id)
  end

end

