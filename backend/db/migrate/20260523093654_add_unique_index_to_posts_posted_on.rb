class AddUniqueIndexToPostsPostedOn < ActiveRecord::Migration[8.1]
  def change
    add_index :posts, :posted_on, unique: true
  end
end
