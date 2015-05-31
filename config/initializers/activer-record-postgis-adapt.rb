  RGeo::ActiveRecord::SpatialFactoryStore.instance.tap do |config|
    config.register(RGeo::Geographic.spherical_factory(srid: 4326 ,
                                                       :has_z_coordinate => true,
                                                       :wkb_parser => {:support_ewkb => true},
                                                       :wkt_parser => {:support_ewkt => true},
                                                       :wkb_generator =>{:tag_format => :ewkb,
                                                                         :emit_ewkb_srid => true},
                                                       :wkt_generator => {:tag_format =>:ewkt,
                                                                          :emit_ewkt_srid =>true}),
                      geo_type: "point")
  end

