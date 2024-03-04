class Eventversion < ApplicationRecord

  # We use the show view form 'event'. There we need updated_at attribute.
  attr_accessor :updated_at

  validates :title, presence: true
end
