class AddSpatialsToTrail < ActiveRecord::Migration
  def change
    add_column :trails , :trail_path ,:line_string, srid: 3857
    add_column :trails , :origin_point , :st_point, srid: 3857
    add_column :trails , :destination_point , :st_point, srid:3857
    add_attachment :trails , :gpx
    add_column  :trails,  :trailgeometry , :string
  end
end
