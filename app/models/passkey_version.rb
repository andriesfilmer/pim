class PasskeyVersion < ApplicationRecord

  self.table_name = 'passkeyversions'

  validates :title, presence: true

end
