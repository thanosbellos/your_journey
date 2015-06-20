class Trail < ActiveRecord::Base

  #has_many :trailsegments , :dependent => :destroy
  #has_many :points ,
  #
  has_and_belongs_to_many :users
  mount_uploader :trailgeometry , TrailGeometryUploader

  validates :name , :start_point , :travel_by , presence: true
  validates :rating , numericality: {only_integer:true , greater_than_or_equal_to:1 , less_than_or_equal_to:5}
  validate :trail_file_size_validation
  validates :trailgeometry,
            :presence => true
  after_create :store_trailgeometry! , :process_geometry_files

  def trail_file_size_validation
    errors[:trailgeometry] << "should be less than 5 mb" if trailgeometry.size >5.megabytes
  end


  class << self;
    attr_accessor :trail_path_factory
    attr_accessor :trail_path_projection_factory
    attr_accessor :point_factory
  end

  self.trail_path_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: 'line_string')
  self.trail_path_projection_factory = trail_path_factory.projection_factory
  self.point_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: 'point')
  CODER = RGeo::GeoJSON.coder(geo_factory: self.trail_path_factory)

 def to_geojson
    features = []

    features << CODER.entity_factory.feature(self.trail_path_geographic,
                                             "Polyline",
                                             {
                                               "stroke":"#fc4353",
                                               "Name": "#{self.name}",
                                               "Length": "#{self.length}"
                                              })
    features << CODER.entity_factory.feature(self.origin_point_geographic,
                                             "Start Point" ,
                                             {"marker-color": "#00ff00",
                                              "marker-symbol": 's',
                                              "marker-size": "medium",
                                              "title": "Start point of track: #{self.name}"}
                                            )


    features  << CODER.entity_factory.feature(self.destination_point_geographic,
                                              "Finish Point",
                                              {"marker-color": "#D63333",
                                               "marker-symbol": "f",
                                               "marker-size": "medium",
                                               "title":"Finish point of trails #{self.name}"
                                              }
                                             )


    collection = CODER.entity_factory.feature_collection(features)

    CODER.encode(collection)

  end

  def trail_path_projected
    self.trail_path
  end

  def trail_path_projected=(value)
    self.trail_path = value
  end

  def trail_path_geographic
    self.class.trail_path_factory.unproject(self.trail_path_projected)
  end

  def trail_path_geographic=(value)
    value = self.class.trail_path_factory.parse_wkt(value) if value.class == String
    self.trail_path = self.class.trail_path_factory.project(value)
  end

  def origin_point_projected
    self.origin_point
  end

  def origin_point_projected=(value)
    self.origin_point = value
  end

  def origin_point_geographic
    self.class.point_factory.unproject(self.origin_point)
  end

  def origin_point_geographic=(value)
    value = self.class.point_factory.parse_wkt(value) if value.class == String
    self.origin_point = self.class.point_factory.project(value)
  end


  def destination_point_projected
    self.destination_point
  end

  def destination_point_projected=(value)
    self.destination_point = value
  end

  def destination_point_geographic
    self.class.point_factory.unproject(self.destination_point)
  end

  def destination_point_geographic=(value)
    value = self.class.point_factory.parse_wkt(value) if value.class == String
    self.destination_point = self.class.point_factory.project(value)
  end

  private

  def process_geometry_files
    if trailgeometry.present?
      parse_tracks_shp_file
    end
  end


  def find_srid_from_prj(layer_file)

    #for_layer is the file path to points or tracks etc
    extension = File.extname(layer_file)
    basename =  File.basename(layer_file , extension)
    prj_file ="#{File.dirname(layer_file)}/#{basename}.prj"
    srid = "4326"
    srid_text =  "to_be_filled"
    if File.exist?(prj_file)
      File.open(prj_file) do |file|
        srid_text = file.read
      end
    else
      puts "file not found"
    end

    query_url = "http://prj2epsg.org/search.json?terms="+srid_text
    r = open(query_url)
    data = JSON.load(r)

    srid = data["codes"][0]["code"] if r.status[1] == "OK"
  end

  def parse_tracks_shp_file

    f = trailgeometry.shp_tracks.path
    srid = find_srid_from_prj(f)

    factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: 'line_string');

    multiline_path = nil
    RGeo::Shapefile::Reader.open(f, factory: factory) do |file|
      file.each do |record|
        multiline_path = record.geometry
      end
    end
    make_linestring(multiline_path)#
    self.save

  end

  def make_linestring(multiline_string)
    lines = multiline_string._elements
    str =  lines.map do|line|
      "ST_GeomFromEWKT('#{line.as_text}')"
    end
    str = str.join(',')
    ast = "SELECT (ST_AsEWKT(ST_MakeLine(ARRAY[#{str}])))"
    self.trail_path_geographic = self.class.connection.execute(ast).values.flatten.first
    self.origin_point = self.trail_path_projected.start_point
    self.destination_point = self.trail_path_projected.end_point
    unless self.length

      ast_sql_length = "SELECT ST_length(ST_GeographyFromText('#{self.trail_path_geographic.as_text}'))"
      self.length = (self.class.connection.execute(ast_sql_length ).values.flatten.first.to_f/1000.0).round(3);

    end
  end

end
