class ChangeTwofaToBooleanOnPasskeys < ActiveRecord::Migration[8.1]
  # twofa was INTEGER (0/1); make it a real boolean to match passkeys.offline.
  # SQLite stores booleans as 0/1, so existing values map directly.
  def up
    change_column :passkeys,        :twofa, :boolean, default: false, null: false
    change_column :passkeyversions, :twofa, :boolean, default: false, null: false
  end

  def down
    change_column :passkeys,        :twofa, :integer, default: 0
    change_column :passkeyversions, :twofa, :integer, default: 0
  end
end
