class TrailSearch

  include ActiveModel::Model

  def initialize(opts={})

    start_loc  = factory.point(*opts[:start_loc])
    finish_loc =  factory.point(*opts[:finish_loc]) if opts[:finish_loc]
    target_obj =  (opts[:finish_loc]||opts[:route]) ?
                  factory.line_string([start_loc , finish_loc]) :
                  start_loc
    @mercator_radius = (opts[:radius] * (1 / Math.cos(start_loc.y / 180.0 * Math::PI))).ceil
    @target_object_for_buffer = target_obj.projection

    puts @target_object_for_buffer

  end

  def search
     Track.where(path_matches)
  end

  alias_method :search_near_user_location ,:search
  alias_method :search_near_route, :search

  protected

  def factory
     @geo_factory ||= RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(:geo_type => 'point')
  end

  def path_matches
     covers(Track.arel_table[:merged_path])
  end

  def covers(column)
    ast =      buffer.st_function(:ST_Covers, column)
    puts ast.to_sql
    ast
  end


  def buffer
     geometry_as_spatial_node.st_function(:ST_Buffer , @mercator_radius, 16)
  end

  def geometry_as_spatial_node
    geometry_from_text(@target_object_for_buffer)
  end

  def geometry_from_text(spatial_object)
     Arel.spatial(spatial_object.as_text)
  end

end
