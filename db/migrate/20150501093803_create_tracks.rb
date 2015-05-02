class CreateTracks < ActiveRecord::Migration
  def change
    create_table :tracks do |t|
      t.string :name
      t.multi_line_string :path , srid: 4326
      t.st_point :start_point_lon_lat_elev , geographic: true
      t.st_point :end_point_lon_lat_elev , geographic: true
      t.belongs_to :trail, index:true
      t.timestamps null:false
    end
  end
end
