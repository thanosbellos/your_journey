class Point < ActiveRecord::Base
  belongs_to :tracksegment
  RGeo::ActiveRecord::SpatialFactoryStore.instance.tap do |config|
    config.register(RGeo::Geographic.spherical_factory(srid: 4326 , :has_z_coordinate => true) , geo_type: "point")
  end
end
