class Trail < ActiveRecord::Base
  validates :start , :travel_by , :name , presence:true

end
