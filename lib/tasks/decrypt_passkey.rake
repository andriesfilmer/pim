# lib/tasks/decrypt_passkey.rake

# Extract encrypted data from the passkey
# rails decrypt:passkey["field",id]
#
# Example usage:
# rails decrypt:passkey["username",687]

namespace :decrypt do
  desc "Decrypt and display encrypted data"
  task :passkey, [:field, :id] => :environment do |t, args|

    #record_id = ENV['ID']      # Pass the ID of the record you want to decrypt
    #field_name = ENV['FIELD']  # Pass the name of the field to decrypt
    field_name = args.field   # Pass the name of the field to decrypt
    record_id = args.id       # Pass the ID of the record you want to decrypt

    if record_id.nil? || field_name.nil?
      puts "Please provide both a record ID with ID=<record_id> and a field name with FIELD=<field_name>"
      exit
    end

    # Load your model
    #ModelClassName = "Passkey"  # Replace with your actual model class name
    #model = ModelClassName.constantize
    record = Passkey.find_by(id: record_id)

    if record.nil?
      puts "Record not found"
      exit
    end

    # Assuming you have a method to decrypt the data, e.g., `decrypt_field`
    #decrypted_data = record.username
    decrypted_data = record.send(field_name)

    puts "Decrypted FIELD #{field_name} for record ID #{record_id}: #{decrypted_data}"
  end
end

