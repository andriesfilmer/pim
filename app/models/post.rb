class Post < ApplicationRecord

  attr_accessor :picture

  alias_attribute :notes, :content

  validates :title, presence: true

end
