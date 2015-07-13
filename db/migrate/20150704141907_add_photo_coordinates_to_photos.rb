class AddPhotoCoordinatesToPhotos < ActiveRecord::Migration
  def change
    add_column :photos, :coordinates, :string
  end
end
