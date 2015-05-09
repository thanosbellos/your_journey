class RemoveGpxContentTypeFromTrack < ActiveRecord::Migration
  def change
    remove_column :tracks , :gpx_content_type
  end
end
