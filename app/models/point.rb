class Point < ActiveRecord::Base
  belongs_to :tracksegment

  class << self;
    attr_accessor :loc_factory
    attr_accessor :loc_projection_factory
  end

  @loc_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: 'point')
  @loc_projection_factory = @loc_factory.projection_factory

  def loc
    self.class.loc_factory.unproject(self[:loc])
  end

  def loc_projected
    self.class.loc_factory._generate_wkt(self[:loc])
  end

  def loc_projected=(value)
    self.loc = value
  end

  def loc_geographic
    self.class.loc_factory.unproject(self.loc)
  end

  def loc_geographic=(value)
    value = self.class.loc_factory.parse_wkt(value) if value.class == String
    self.loc = self.class.loc_factory.project(value)
  end

end
