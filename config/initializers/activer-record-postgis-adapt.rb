POINT_FACTORY = RGeo::Geographic.simple_mercator_factory(srid: 3785 ,
                                                       :wkb_parser => {:support_ewkb => true},
                                                       :wkt_parser => {:support_ewkt => true},
                                                       :wkb_generator =>{:tag_format => :ewkb,
                                                                         :emit_ewkb_srid => true},
                                                       :wkt_generator => {:tag_format =>:ewkt,
                                                                          :emit_ewkt_srid =>true})

RGeo::ActiveRecord::SpatialFactoryStore.instance.tap do |config|
  config.register(POINT_FACTORY.projection_factory,geo_type: "point")
end

