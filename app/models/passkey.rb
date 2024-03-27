class Passkey < ApplicationRecord

  # https://guides.rubyonrails.org/active_record_encryption.html
  encrypts :username #, previous: { deterministic: true }
  encrypts :password
  encrypts :notes, deterministic: true #, previous: { deterministic: false }

  validates :title, presence: true

  def self.encryptPasskeyUp
    passkeys =  Passkey.all
    passkeys.each do |passkey|
      passkey.encrypt
    end
  end

  def self.encryptPasskeyDown
   # Needed in the config you're using (production.rb, development.rb)
   # config.active_record.encryption.support_unencrypted_data = true
   passkeys =  Passkey.all
   passkeys.each do |passkey|
      passkey.decrypt
    end
  end
end
