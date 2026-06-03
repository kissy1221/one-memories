class AddActiveToReminders < ActiveRecord::Migration[8.1]
  def change
    add_column :reminders, :active, :boolean, null: false, default: true
  end
end
