class AddTrackgeometryToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :trackgeometry, :string
  end
end
