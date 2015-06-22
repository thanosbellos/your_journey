SPATIAL_REF_SYSTEM =  RGeo::CoordSys::SRSDatabase::ActiveRecordTable.new
SRID = 3857
entry = SPATIAL_REF_SYSTEM.get(3857)
PROJ4_3857 = entry.proj4
COORD_SYS = entry.coord_sys

entry = SPATIAL_REF_SYSTEM.get(4326)
PROJ4_4326 = entry.proj4
COORD_SYS_4326 = entry.coord_sys

FACTORY = RGeo::Geographic.projected_factory(projection_proj4: PROJ4_3857,
                                             projection_coord_sys: COORD_SYS,
                                             projection_srid: 3857,
                                             buffer_resolution: 1,
                                             proj4: PROJ4_4326,
                                             coord_sys: COORD_SYS_4326,
                                             srid: 4326,
                                             :wkb_parser => {:support_ewkb => true},
                                             :wkt_parser => {:support_ewkt => true},
                                             :wkb_generator =>{:tag_format => :ewkb,
                                                               :emit_ewkb_srid => true},
                                             :wkt_generator => {:tag_format =>:ewkt,
                                                                :emit_ewkt_srid =>true
                                                               })


RGeo::ActiveRecord::SpatialFactoryStore.instance.tap do |config|

  config.register(FACTORY.projection_factory ,
                  geo_type: "Point",
                  srid: 3857 ,
                  sql_type: "geometry(Point,3857)")
  config.register(FACTORY.projection_factory ,
                  geo_type: "LineString",
                  srid: 3857,
                  sql_type: "geometry(LineString,3857)")

end

