class Post < ApplicationRecord

  attr_accessor :picture

  alias_attribute :notes, :content
  alias_attribute :created_at, :created
  alias_attribute :updated_at, :updated

  validates :title, presence: true

end
