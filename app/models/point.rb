class Point < ActiveRecord::Base
  belongs_to :tracksegment

  class << self;
    attr_accessor :point_factory
    attr_accessor :projection_factory
  end

  @point_factory = POINT_FACTORY = RGeo::Geographic.simple_mercator_factory(srid: 3785 ,
                                                       :wkb_parser => {:support_ewkb => true},
                                                       :wkt_parser => {:support_ewkt => true},
                                                       :wkb_generator =>{:tag_format => :ewkb,
                                                                         :emit_ewkb_srid => true},
                                                       :wkt_generator => {:tag_format =>:ewkt,
                                                                          :emit_ewkt_srid =>true})
  @projection_factory = @point_factory.projection_factory

  def point_projected
    self.loc
  end

  def point_projected=(value)
    self.loc = value
  end

  def point_geographic
    Point.point_factory.unproject(self.loc)
  end

  def point_geographic=(value)
    self.loc = Point.point_factory.project(value)
  end

end
