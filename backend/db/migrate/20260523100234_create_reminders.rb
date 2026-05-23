class CreateReminders < ActiveRecord::Migration[8.1]
  def change
    create_table :reminders do |t|
      t.string :email

      t.timestamps
    end
    add_index :reminders, :email, unique: true
  end
end
