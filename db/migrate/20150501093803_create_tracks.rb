class CreateTracks < ActiveRecord::Migration
  def change
    create_table :tracks do |t|
      t.string :name
      t.multi_line_string :path , srid: 3785
      t.st_point :start, srid: 3785
      t.st_point :finish , srid: 3785
      t.belongs_to :trail, index:true
      t.timestamps null:false
    end
  end
end
