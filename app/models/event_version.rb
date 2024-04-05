class EventVersion < ApplicationRecord

  self.table_name = 'eventversions'

  # We use the show view form 'event'. There we need updated_at attribute.
  attr_accessor :updated_at

  alias_attribute :notes, :description
  alias_attribute :created_at, :created
  alias_attribute :category, :className

  validates :title, presence: true
end
