class Eventversion < ApplicationRecord

  # We use the show view form 'event'. There we need updated_at attribute.
  attr_accessor :updated_at

  alias_attribute :notes, :description
  alias_attribute :created_at, :created

  validates :title, presence: true
end
