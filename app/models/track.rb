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
  end
  @path_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: 'multiline_string')
  @merged_path_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: 'line_string')
  @path_projection_factory = @path_factory.projection_factory
  @merged_path_projection_factory = @merged_path_factory.projection_factory
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
    factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: 'point')

    puts self.inspect
    RGeo::Shapefile::Reader.open(f,:factory => factory) do |file|
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
    #self.tracksegments.each do |tracksegment|
      #tracksegment.create_path_from_points
    #end
    #track_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: "multiline_string")
    #puts track_factory
    #self.path = track_factory.multi_line_string(self.tracksegments.order(id: :asc).pluck(:tracksegment_path))
    #line_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: "line_string")
    #ast_sql_statement = Arel.spatial(self.path.as_text).st_function(:ST_LineMerge).st_function(:ST_AsText).st_function(:SELECT).to_sql
    #new_path = ActiveRecord::Base.connection.execute(ast_sql_statement).values.flatten.first
    #self.merged_path =  new_path.match('MULTILINESTRING') ? line_factory.line_string(self.points.order(id: :asc).pluck(:lonlatheight)) : new_path
    #puts new_path
    #puts new_path.match('MULTILINESTRING')
    #self.start = merged_path.start_point
    #self.finish = merged_path.end_point

    self.save
  end


end
