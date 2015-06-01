class Tracksegment < ActiveRecord::Base

  belongs_to :track
  has_many :points, :dependent => :destroy
 class << self;
    attr_accessor :segment_factory
    attr_accessor :segment_projection_factory
  end

  @segment_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: 'line_string')
  @segment_projection_factory = @segment_factory.projection_factory


 def tracksegment_path
  self.class.segment_factory.unproject(self[:tracksegment_path])
 end


  def segment_projected
    self.tracksegment_path
  end

  def segment_projected=(value)
    self.tracksegment_path = value
  end


  def segment_geographic
    self.class.segment_factory.unproject(self.tracksegment_path)
  end

  def segment_geographic=(value)
    value = self.class.segment_factory.parse_wkt(value) if value.class == String
    self.loc = self.class.segment_factory.project(value)
  end

  def create_path_from_points
    line_string= self.class.segment_projection_factory.line_string(self.points.order(id: :asc).pluck(:loc))
    self.segment_projected = line_string
  end


end
