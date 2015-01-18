class CreateTrails < ActiveRecord::Migration
  def change
    create_table :trails do |t|
      t.string :start
      t.string :destination
      t.string :travel_by
      t.integer :rating

      t.timestamps null: false
    end
  end
end
