class Trail < ActiveRecord::Base
  validates :name ,:start_point , :travel_by , presence: true
  validates :rating , numericality: {only_integer:true , greater_than_or_equal_to:1 , less_than_or_equal_to:5}

  has_and_belongs_to_many :users
  has_one :track , dependent: :destroy
end
