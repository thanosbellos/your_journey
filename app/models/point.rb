class Point < ActiveRecord::Base
  belongs_to :tracksegment
  self.set_rgeo_factory_for_column(:lonlatheight , RGeo::Geographic.spherical_factory(:srid => 4326,:has_z_coordinate =>true) )
end
