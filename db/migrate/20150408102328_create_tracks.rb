class CreateTracks < ActiveRecord::Migration
  def change
    create_table :tracks do |t|
      t.belongs_to :trail, index: true
      t.string :name
      t.timestamps null: false
    end
  end
end
