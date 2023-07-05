class Postversion < ApplicationRecord

  # We use the show view form 'post'. There we need updated_at attribute.
  attr_accessor :updated_at

  validates :title, presence: true
end
