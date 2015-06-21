SPATIAL_REF_SYSTEM =  RGeo::CoordSys::SRSDatabase::ActiveRecordTable.new
SRID = 3857
entry = SPATIAL_REF_SYSTEM.get(3857)
PROJ4 = entry.proj4
COORD_SYS = entry.coord_sys

FACTORY = RGeo::Geographic.projected_factory(projection_proj4: PROJ4,
                                             projection_coord_sys: COORD_SYS,
                                             projection_srid: SRID,
                                             buffer_resolution: 8,
                                             srid: 4326,
                                             srs_database: SPATIAL_REF_SYSTEM,
                                             :wkb_parser => {:support_ewkb => true},
                                             :wkt_parser => {:support_ewkt => true},
                                             :wkb_generator =>{:tag_format => :ewkb,
                                                               :emit_ewkb_srid => true},
                                             :wkt_generator => {:tag_format =>:ewkt,
                                                                :emit_ewkt_srid =>true
                                                               })


RGeo::ActiveRecord::SpatialFactoryStore.instance.tap do |config|

  config.register(FACTORY, geo_type: "point")
  config.register(FACTORY, geo_type: "line_string")
  config.register(FACTORY , geo_type: "multiline_string")

end

