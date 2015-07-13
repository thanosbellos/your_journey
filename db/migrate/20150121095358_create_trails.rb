class CreateTrails < ActiveRecord::Migration
  def change
    create_table :trails do |t|
      t.string :name
      t.string :start_point
      t.string :end_point
      t.float :length
      t.float :duration
      t.integer :rating
      t.string :travel_by

      t.belongs_to :user , index: true
      t.timestamps null: false
    end
  end
end
