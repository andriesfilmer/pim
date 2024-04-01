class PasskeyShares < ActiveRecord::Migration[7.0]
  def change
    create_table :passkeyshares do |t|
      t.integer :passkey_id, null: false
      t.integer :user_id, null: false
      t.integer :linked_user_id, null: false
      t.string :email, null: false

      t.timestamps
    end
  end
end
