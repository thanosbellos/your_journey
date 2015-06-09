require 'open-uri'

class Track < ActiveRecord::Base
  belongs_to :trail
  has_many :tracksegments , :dependent => :destroy
  has_many :points , :through => :tracksegments
  mount_uploader :trackgeometry , TrackGeometryUploader

   after_create :store_trackgeometry! ,:process_geometry_files ,  :create_path_from_segments
  #before_save :check_trackgeometry

  class << self;
    attr_accessor :path_factory
    attr_accessor :merged_path_factory
    attr_accessor :path_projection_factory
    attr_accessor :merged_path_projection_factory
    attr_accessor :point_factory
  end

  @path_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: 'multiline_string')
  @merged_path_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: 'line_string')
  @path_projection_factory = @path_factory.projection_factory
  @merged_path_projection_factory = @merged_path_factory.projection_factory
  @point_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: 'point')
  CODER = RGeo::GeoJSON.coder(geo_factory: @point_factory)


  def to_feature(attr)
    ast = CODER.entity_factory.feature(self[attr])
    puts ast
    ast
  end

  def to_geojson
    features = []
    track_id = self.id
    trail_id = self.trail.id

    features << CODER.entity_factory.feature(self.merged_path_geographic, "#{track_id}_path", {"stroke": "#fc4353"})
    features << CODER.entity_factory.feature(self.start_geographic,
                                             "#{track_id}_start" ,
                                             {"marker-color": "#00ff00",
                                              "marker-symbol": 's',
                                              "marker-size": "medium",
                                              "title": "Start point of track: #{self.trail.name}"}
                                            )


    features  << CODER.entity_factory.feature(self.finish_geographic,
                                              "#{track_id}_finish",
                                              {"marker-color": "#D63333",
                                               "marker-symbol": "f",
                                               "marker-size": "medium",
                                               "title":"Finish point of trails #{self.trail.name}"
                                              }
                                             )


    collection = CODER.entity_factory.feature_collection(features)

    CODER.encode(collection)

  end

  def merged_path_projected
    self.merged_path
  end

  def merged_path_projected=(value)
    self.merged_path = value
  end

  def merged_path_geographic
    self.class.merged_path_factory.unproject(self.merged_path)
  end

  def merged_path_geographic=(value)
    value = self.class.merged_path_factory.parse_wkt(value) if value.class == String
    self.merged_path = self.class.merged_path_factory.project(value)
  end

  def start_projected
    self.start
  end

  def start_projected=(value)
    self.start = value
  end

  def start_geographic
    self.class.point_factory.unproject(self.start)
  end

  def start_geographic=(value)
    value = self.class.point_factory.parse_wkt(value) if value.class == String
    self.start = self.class.point_factory.project(value)
  end


  def finish_projected
    self.finish
  end

  def finish_projected=(value)
    self.finish = value
  end

  def finish_geographic
    self.class.point_factory.unproject(self.finish)
  end

  def finish_geographic=(value)
    value = self.class.point_factory.parse_wkt(value) if value.class == String
    self.finish = self.class.point_factory.project(value)
  end





  private


  def process_geometry_files

    if trackgeometry.present? && trackgeometry_changed?
      parse_points_shp_file
    end

  end

  def find_srid_from_prj(layer_file)

    #for_layer is the file path to points or tracks etc
    extension = File.extname(layer_file)
    basename =  File.basename(layer_file , extension)
    prj_file ="#{File.dirname(layer_file)}/#{basename}.prj"
    srid = "4326"
    srid_text =  "to_be_filled"
    puts prj_file
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

  def parse_points_shp_file

    f = trackgeometry.shp_track_points.path
    old_seg_id = nil
    tmp_segment = nil
    srid = find_srid_from_prj(f)
   point_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: 'point')

    puts self.inspect
    RGeo::Shapefile::Reader.open(f,:factory => point_factory) do |file|
      num_records = file.num_records
      file.each do |record|
          tmp_point = Point.new
          tmp_point.loc = record.geometry.projection #.as_text.insert(-2 ," #{record.attributes[:ele.to_s]}")
          new_seg_id = record.attributes["trksegid"]
          if(new_seg_id != old_seg_id)
            self.tracksegments << tmp_segment if old_seg_id
            tmp_segment = Tracksegment.new
          end
          tmp_segment.points << tmp_point
          old_seg_id = new_seg_id
      end
    end
    self.tracksegments << tmp_segment
  end

  def create_path_from_segments

    multi_line_factory = self.class.path_projection_factory
    line_factory = self.class.merged_path_projection_factory

    self.tracksegments.each do |tracksegment|
      tracksegment.create_path_from_points
    end

    merge_track_segments

    self.save
  end

  def merge_track_segments

    multi_line_factory = self.class.path_projection_factory
    line_factory = self.class.merged_path_projection_factory
    ast_sql_statement = "SELECT (ST_AsEWKT(ST_MakeLine(segments.tracksegment_path ORDER BY id))) AS test from tracksegments AS segments WHERE segments.track_id = #{self.id}"
    new_path = ActiveRecord::Base.connection.execute(ast_sql_statement).values.flatten.first
    self.merged_path_projected = new_path
    self.start = self.merged_path.start_point
    self.finish = self.merged_path.end_point

  end


end
