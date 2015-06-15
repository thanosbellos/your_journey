class TrailSearch

  include ActiveModel::Model


  def initialize(opts={})
    start_loc  = factory.point(*opts[:start_loc])
    finish_loc =  factory.point(*opts[:finish_loc]) if opts[:finish_loc]
    route_coordinates = Polylines::Decoder.decode_polyline(opts[:sample_route]) if (opts[:sample_route])
    route = { "type": "LineString" , "coordinates": route_coordinates} if route_coordinates

    if(route || finish_loc)
      if(route)
        puts route
        target_obj = coder.decode(route.deep_stringify_keys)
      else

        target_obj = factory.line_string([start_loc , finish_loc])

      end
    else
      target_obj =start_loc
    end
    @mercator_radius = (opts[:radius] * (1 / Math.cos(start_loc.y / 180.0 * Math::PI))).ceil
    @target_object_for_buffer = target_obj.projection


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
     buffer.st_function(:ST_Covers, column)
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

  def coder
    @coder ||= RGeo::GeoJSON.coder(geo_factory: factory)
  end


end
