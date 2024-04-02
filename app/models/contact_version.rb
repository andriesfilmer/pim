class ContactVersion < ApplicationRecord

  self.table_name = 'contactversions'
  attr_accessor :updated_at

  alias_attribute :created_at, :created

  validates :name, presence: true
end
