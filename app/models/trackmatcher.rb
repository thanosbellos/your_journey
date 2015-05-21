class TrackMatcher

  include ActiveModel::Model

  def initialize(start_coordinate, finish_coordinate)
    @start_point  = geo_factory.point(*start_coordinate)
    @finish_point = geo_factory.point(*finish_coordinate)
  end

  def find
    Track.where(start_matches.and finish_matches)
  end

  protected

  def start_matches
    covers(Track.arel_table[:start])
  end

  def finish_matches
    covers(Track.arel_table[:finish])
  end

  def line_string
    @line_string ||= geography_from_text(geo_factory.line_string [@start_point, @finish_point])
  end

  def buffer
    line_string.st_function(:ST_Buffer , 20000) # distance in metres
  end

  def covers(column)
    buffer.st_function(:ST_Covers, column)
  end

  def geo_factory
    @geo_factory ||= RGeo::Geographic.spherical_factory(srid: 4326)
  end

  def geography_from_text(spatial_object)
    Arel.spatial(spatial_object.as_text).st_function(:ST_AsEWKT).st_function(:ST_GeographyFromText)
  end
end
