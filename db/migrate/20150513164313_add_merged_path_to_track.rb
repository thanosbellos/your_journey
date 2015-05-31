class AddMergedPathToTrack < ActiveRecord::Migration
  def change
    add_column :tracks, :merged_path, :line_string , srid: 3785
  end
end
