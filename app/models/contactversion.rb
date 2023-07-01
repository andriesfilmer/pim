class Contactversion < ApplicationRecord

  # We use the show view form 'contact'. There we need updated_at attribute.
  attr_accessor :updated_at

  validates :name, presence: true
end
