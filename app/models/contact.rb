class Contact < ApplicationRecord


  #after_create_commit -> { broadcast_prepend_to "contacts", partial: "contacts/contact", locals: { quote: self }, target: "contacts" }
  #after_create_commit { broadcast_append_to contact }
  #after_create_commit -> { broadcast_prepend_to "contacts" }
  #after_update_commit -> { broadcast_replace_to "contacts" }
  #after_destroy_commit -> { broadcast_remove_to "contacts" }
  # Those three callbacks are equivalent to the following single line
  #broadcasts_to :contact
  #broadcasts_to ->(contact) { "contacts" }, inserts_by: :prepend

  # For JSON, created a view for created -> created_at, updated -> updated_at
  #self.table_name = "contacts_view"
  #self.primary_key = "id"

  validates :name, presence: true

end
