class PostVersion < ApplicationRecord

  self.table_name = 'postversions'
  attr_accessor :updated_at

  self.inheritance_column = 'zoink'
  alias_attribute :category, :type
  alias_attribute :notes, :content
  alias_attribute :created_at, :created

  validates :title, presence: true
end
