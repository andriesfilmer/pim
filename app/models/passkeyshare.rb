class Passkeyshare < ApplicationRecord

  validates :passkey_id, presence: true
  validates :user_id, presence: true
  validates :linked_user_id, presence: true
  validates :email, presence: true

  belongs_to :passkey
end
