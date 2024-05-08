class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
    :validatable, :confirmable, :lockable, :trackable

  validates :name, presence: true

  has_many :contacts, dependent: :destroy
  has_many :contact_versions, dependent: :destroy
  has_many :events, dependent: :destroy
  has_many :event_versions, dependent: :destroy
  has_many :passkeys, dependent: :destroy
  has_many :passkey_versions, dependent: :destroy
  has_many :posts, dependent: :destroy
  has_many :post_versions, dependent: :destroy

end
