class Tracksegment < ActiveRecord::Base

  belongs_to :track
  has_many :points, :dependent => :destroy

  RGeo::ActiveRecord::SpatialFactoryStore.instance.tap do |config|
    config.default = RGeo::Geos.factory_generator
    config.register(RGeo::Geographic.spherical_factory(srid: 4326) , geo_type: "line_string")
  end

  def create_path_from_points

    segment_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: "line_string")
    line_string= segment_factory.line_string(self.points.order(:id , 'asc').pluck(:lonlatheight))
    self.update(tracksegment_path: line_string)
  end
end
