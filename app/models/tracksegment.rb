class Tracksegment < ActiveRecord::Base

  belongs_to :track
  has_many :points, :dependent => :destroy
  after_save :create_path_from_points
  RGeo::ActiveRecord::SpatialFactoryStore.instance.tap do |config|
    config.default = RGeo::Geos.factory_generator
    config.register(RGeo::Geographic.spherical_factory(srid: 4326) , geo_type: "line_string")
  end

  def create_path_from_points

    segment_factory = Tracksegment.rgeo_factory_for_column(:tracksegment_path)
    line_string= segment_factory.line_string(self.points.pluck(:lonlatheight))
    self.update_column(tracksegment_path: line_string)
  end
end
