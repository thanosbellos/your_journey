class AddTrackSegments < ActiveRecord::Migration
  def change
    create_table :tracksegments do |t|
      t.references :track, index: true, foreign_key: true
      t.line_string :tracksegment_path , srid: 3785
      t.timestamps null: false
    end
  end
end
