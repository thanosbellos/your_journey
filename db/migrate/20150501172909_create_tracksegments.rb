class CreateTracksegments < ActiveRecord::Migration
  def change
    create_table :tracksegments do |t|
      t.references :track, index: true, foreign_key: true

      t.line_string :tracksegment_path , geographic: true
      t.timestamps null: false
    end
  end
end
