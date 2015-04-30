class DropTables < ActiveRecord::Migration
  def change
    drop_table :points
    drop_table :tracksegments
    drop_table :tracks
  end
end
