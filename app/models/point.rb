class Point < ActiveRecord::Base
  belongs_to :tracksegment
  self.set_rgeo_factory_for_column(:latlon , RGeo::Geographic.spherical_factory(:srid => 4326))
end
