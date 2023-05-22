class Contact < ApplicationRecord

  #broadcasts_to :contact

  #after_create_commit { broadcast_append_to contact }
  #after_destroy_commit { broadcast_remove_to contact }

  # For JSON, created a view for created -> created_at, updated -> updated_at
  #self.table_name = "contacts_view"
  #self.primary_key = "id"

  validates :name, presence: true

end
