class Postversion < ApplicationRecord

  attr_accessor :updated_at

  alias_attribute :notes, :content

  validates :title, presence: true
end
