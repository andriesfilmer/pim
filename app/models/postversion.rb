class Postversion < ApplicationRecord

  attr_accessor :updated_at

  validates :title, presence: true
end
