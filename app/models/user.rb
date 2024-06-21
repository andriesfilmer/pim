class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
    :validatable, :confirmable, :lockable, :trackable

  validates :name, presence: true
  validates :password, format: { with: PASSWORD_FORMAT, message: :invalid_password }, unless: Proc.new { |a| a.password.blank? }

  has_many :contacts, dependent: :destroy
  has_many :contact_versions, dependent: :destroy
  has_many :events, dependent: :destroy
  has_many :event_versions, dependent: :destroy
  has_many :passkeys, dependent: :destroy
  has_many :passkey_versions, dependent: :destroy
  has_many :posts, dependent: :destroy
  has_many :post_versions, dependent: :destroy

end
