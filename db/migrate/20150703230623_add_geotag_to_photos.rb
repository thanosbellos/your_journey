class AddGeotagToPhotos < ActiveRecord::Migration
  def change
    add_column :photos, :geotag, :st_point, srid: 3857
  end
end
