class AddMergedPathToTrack < ActiveRecord::Migration
  def change
    add_column :tracks, :merged_path, :line_string ,:geographic => true
  end
end
