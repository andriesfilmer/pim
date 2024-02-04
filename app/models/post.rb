class Post < ApplicationRecord

  attr_accessor :picture

  validates :title, presence: true

end
