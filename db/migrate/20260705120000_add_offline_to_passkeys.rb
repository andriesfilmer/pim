class AddOfflineToPasskeys < ActiveRecord::Migration[8.1]
  def change
    add_column :passkeys, :offline, :boolean, default: false, null: false
  end
end
