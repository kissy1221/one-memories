class AddMoodToPosts < ActiveRecord::Migration[8.1]
  def change
    add_column :posts, :mood, :integer
  end
end
