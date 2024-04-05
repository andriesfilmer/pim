class PasskeyShare < ApplicationRecord

  validates :passkey_id, presence: true
  validates :user_id, presence: true, uniqueness: { scope: [:passkey, :linked_user_id] }
  validates :linked_user_id, presence: true
  validates :email, presence: true
  #validate  :passkey_owner_exists

  belongs_to :passkey

  def passkey_owner_exists
    #unless Passkey.where(id: self.passkey_id).where(user_id: self.user_id).exists?
    #  errors.add :key, 'does not belong to you!'
    #end
    if Passkey.where(id: self.passkey_id).where(user_id: self.user_id).none?
      errors.add :passkey, 'does not exists!'
    end
  end
end
