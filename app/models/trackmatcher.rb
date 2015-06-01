class TrackMatcher

  include ActiveModel::Model

  def initialize(start_coordinate , radius)
    p_lonlat = point_factory.point(*start_coordinate)
    @mercator_radius = (radius * (1 / Math.cos(p_lonlat.y / 180.0 * Math::PI))).ceil
    @start_point = p_lonlat.projection
  end

  def find_near
    Track.where(start_matches)
  end

  protected

  def start_matches
    ast=    covers(Track.arel_table[:merged_path])
    puts ast.to_sql
    ast
  end


  def buffer
    puts @mercator_radius
  ast =  point.st_function(:ST_Buffer , @mercator_radius,16) # distance in metres
  puts ast.to_sql
  ast
  end

  def point
    geometry_from_text(@start_point)
  end

  def covers(column)
    ast =   buffer.st_function(:ST_Covers, column)
    puts ast.to_sql
    ast
  end

  def point_factory
    @geo_factory ||= RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(:geo_type => 'point')
  end

  def geometry_from_text(spatial_object)
    ast = Arel.spatial(spatial_object.as_text)
    puts ast
    ast
  end
end
