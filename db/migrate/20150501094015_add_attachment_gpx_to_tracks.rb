class AddAttachmentGpxToTracks < ActiveRecord::Migration
  def self.up
    add_attachment :tracks , :gpx
  end

  def self.down
    remove_attachment :tracks, :gpx
  end
end
