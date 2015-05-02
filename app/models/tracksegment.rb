class Tracksegment < ActiveRecord::Base

  belongs_to :track
  has_many :points, :dependent => :destroy
  self.set_rgeo_factory_for_column(:tracksegment_path , RGeo::Geographic.spherical_factory(:srid => 4326))


  def create_path_from_points

    segment_factory = Tracksegment.rgeo_factory_for_column(:tracksegment_path)
    line_string= segment_factory.line_string(self.points.pluck(:lonlatheight))
    self.update(tracksegment_path: line_string)
  end
end
