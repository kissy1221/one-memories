class AddUserIdAndNotifyHourToReminders < ActiveRecord::Migration[8.1]
  def change
    add_reference :reminders, :user, null: true, foreign_key: true
    add_column :reminders, :notify_hour, :integer, null: false, default: 21
  end
end
