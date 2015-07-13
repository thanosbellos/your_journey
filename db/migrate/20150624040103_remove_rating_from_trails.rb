class RemoveRatingFromTrails < ActiveRecord::Migration
  def change
    remove_column :trails , :rating
  end
end
