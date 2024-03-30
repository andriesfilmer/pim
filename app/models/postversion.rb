class Postversion < ApplicationRecord

  attr_accessor :updated_at

  alias_attribute :notes, :content
  alias_attribute :created_at, :created

  validates :title, presence: true
end
