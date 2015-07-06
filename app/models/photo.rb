class Photo < ActiveRecord::Base
  include Rails.application.routes.url_helpers

  belongs_to :trail
  mount_uploader :image, ImageUploader


  def to_jq_upload
    trail = self.trail

    {
      "name" => read_attribute(:image),
      "size" => image.size,
      "url" => image.url,
      "thumbnail_url" => image.thumb.url,
      "delete_url" => trail_photo_path(trail.id , self.id),
      "delete_type" => "DELETE",
      "delete_method" => "delete"
    }
  end


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
    feature = self.class.geojson_coder.entity_factory.feature( self.geotag,self.id, {"marker-size": "small",
                                                                                     "zIndexOffset": "100",
                                                                           "marker-color": "#ff8888",
                                                                           "marker-symbol": "camera",
                                                                           "url": self.image.url })

    return feature
  else

    return nil

  end





  end

end
