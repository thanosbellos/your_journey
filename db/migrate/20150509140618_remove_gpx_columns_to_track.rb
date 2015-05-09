class RemoveGpxColumnsToTrack < ActiveRecord::Migration
  def change
    remove_column :tracks , :gpx_file_name
    remove_column :tracks , :gpx_file_size
    remove_column :tracks , :gpx_updated_at
  end
end
