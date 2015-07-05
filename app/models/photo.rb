class Photo < ActiveRecord::Base
  belongs_to :trail
  mount_uploader :image, ImageUploader



  class << self;

    attr_accessor :geotag_factory
    attr_accessor :geojson_coder
  end

  self.geotag_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(:geo_type => "Point",
                                                                                 srid: 3857 ,
                                                                                 sql_type:"geometry(Point,3857)")

  self.geojson_coder = RGeo::GeoJSON.coder(geo_factory: self.geotag_factory)


  def geotag_feature

  factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(:geo_type => "Point",
                                                                     srid: 3857,
                                                                     sql_type:"geometry(Point,3857)")

  if self.geotag
    feature = self.class.geojson_coder.entity_factory.feature( self.geotag,nil, {"marker-size": "small",
                                                                           "marker-coloer": "#ff8888",
                                                                           "marker-symbol": "camera",
                                                                           "url": self.image.url })

    return feature
  else

    return nil

  end





  end

end
