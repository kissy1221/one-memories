class AddUnsubscribeTokenToReminders < ActiveRecord::Migration[8.1]
  def change
    add_column :reminders, :unsubscribe_token, :string, null: false, default: ""
    add_index :reminders, :unsubscribe_token, unique: true
  end
end
