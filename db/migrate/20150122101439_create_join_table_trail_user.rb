class CreateJoinTableTrailUser < ActiveRecord::Migration
  def change
    create_join_table :trails, :users do |t|
     t.index [:trail_id, :user_id]
     t.index [:user_id, :trail_id]
    end
  end
end
