class Contact < ApplicationRecord

  # For JSON, created a view for created -> created_at, updated -> updated_at
  #self.table_name = "contacts_view"
  #self.primary_key = "id"

  validates :name, presence: true

end
