class AddDifficultyToTrails < ActiveRecord::Migration
  def change
    add_column :trails, :difficulty, :integer
  end
end
