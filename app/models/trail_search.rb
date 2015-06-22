class TrailSearch

  include ActiveModel::Model


  def initialize(opts={})
    start_loc  = FACTORY.point(*opts[:start_loc])
    finish_loc =  FACTORY.point(*opts[:finish_loc]) if opts[:finish_loc]
   # route_coordinates = Polylines::Decoder.decode_polyline(opts[:sample_route],1e6) if (opts[:sample_route])

    @mercator_radius = (opts[:radius] * (1 / Math.cos(start_loc.y / 180.0 * Math::PI))).floor


    route = JSON.parse(opts[:sample_route]).deep_stringify_keys if opts[:sample_route]

    if(route || finish_loc)
      if(route)
        #target_obj = coder.decode(route.deep_stringify_keys)
        target_obj = coder.decode(route).first.geometry
        puts target_obj.geometry_type
      else

        target_obj = FACTORY.line_string([start_loc , finish_loc])

      end
      #target_obj = target_obj.buffer(opts[:radius]).projection

    else
      target_obj = start_loc

    end
    @target_object_for_buffer = target_obj.projection



  end

  def search
    Trail.where(path_matches)
  end

  alias_method :search_near_user_location ,:search
  alias_method :search_near_route, :search

  protected

  def factory
     @geo_factory ||= FACTORY
  end

  def path_matches
     covers(Trail.arel_table[:trail_path])
  end

  def covers(column)
    case @target_object_for_buffer.geometry_type
    when RGeo::Feature::Point
      geometry_as_spatial_node.st_function(:ST_DWithin , column , @mercator_radius)
    else
      geometry_as_spatial_node.st_function(:ST_Covers, column)
    end
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
