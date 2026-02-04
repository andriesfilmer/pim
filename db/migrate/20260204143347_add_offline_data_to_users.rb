class AddOfflineDataToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :offline_data, :boolean, default: false
  end
end
