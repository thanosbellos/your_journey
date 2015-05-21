class RenameTrackColumns < ActiveRecord::Migration
  def change
    rename_column :tracks, :start_point_lon_lat_elev , :start
    rename_column :tracks , :end_point_lon_lat_elev , :finish
  end
end
