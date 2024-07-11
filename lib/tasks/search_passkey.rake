# lib/tasks/search_passkey.rake
#
# Search title from model Passkey and show encrypted data
# for fields: username, password, notes.
#
# Usages: rails search:passkeys["search_term"]

namespace :search do
  desc "Search passkeys by title"
  task :passkeys, [:term] => :environment do |t, args|
    if args.term.nil?
      puts "Please provide a search term. Example: rails search:passkeys['search term']"
    else
      # Perform the search
      passkeys = Passkey.where("title LIKE ?", "%#{args.term}%")

      # If only one record found.
      if passkeys.one?
        print_decrypted_data(passkeys.take.id)
        exit
      end

      # If multiple records found.
      if passkeys.any?

        passkeys.each do |passkey|
          puts "ID: #{passkey.id}, Title: #{passkey.title}"
        end

        puts "Give a ID and enter:"
        id = gets.chomp
        print_decrypted_data(id)

      else
        puts "No passkeys found with the title containing '#{args.term}'"
      end

    end
  end

  def print_decrypted_data(id)
    # Run other task to find uncrypted data for each field.
    [:username, :password, :notes].each do | field |
      Rake::Task["decrypt:passkey"].invoke(field,id)
      Rake::Task["decrypt:passkey"].reenable
    end
  end

end

