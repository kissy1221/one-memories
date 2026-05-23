class ChangePostsPostedOnUniquenessToScopedByUser < ActiveRecord::Migration[8.1]
  def change
    remove_index :posts, :posted_on
    add_index :posts, [:posted_on, :user_id], unique: true
  end
end
