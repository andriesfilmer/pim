class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
    :validatable, :confirmable, :lockable, :trackable

  has_many :contacts, dependent: :destroy
  has_many :contactversions, dependent: :destroy
  has_many :events, dependent: :destroy
  has_many :eventversions, dependent: :destroy
  has_many :passkeys, dependent: :destroy
  has_many :passkeyversions, dependent: :destroy
  has_many :posts, dependent: :destroy
  has_many :postversions, dependent: :destroy

end
