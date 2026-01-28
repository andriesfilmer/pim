class PasskeyVersion < ApplicationRecord
  # Match encryption from Passkey model
  encrypts :username
  encrypts :password
  encrypts :notes, deterministic: true

  self.table_name = 'passkeyversions'

  validates :title, presence: true
end
