class CreatePoints < ActiveRecord::Migration
  def change
    create_table :points do |t|
      t.references :tracksegment, index: true, foreign_key: true
      t.string :name
      t.st_point :lonlatheight, :geographic => true, has_z:true

      t.timestamps null: false
    end
  end
end
