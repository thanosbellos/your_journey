require 'open-uri'

class Track < ActiveRecord::Base
  belongs_to :trail
  has_many :tracksegments , :dependent => :destroy
  has_many :points , :through => :tracksegments
  mount_uploader :trackgeometry , TrackGeometryUploader

  RGeo::ActiveRecord::SpatialFactoryStore.instance.tap do |config|
    config.default = RGeo::Geos.factory_generator
    config.register(RGeo::Geographic.spherical_factory(srid: 4326) , geo_type: "line_string")
    config.register(RGeo::Geographic.spherical_factory(srid: 4326) , geot_type: "multiline_string")
  end
  after_create :store_trackgeometry! ,:process_geometry_files , :create_path_from_segments
  #before_save :check_trackgeometry


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
    factory = RGeo::Geographic.spherical_factory(:srid =>4326)
    puts self.inspect
    RGeo::Shapefile::Reader.open(f,:factory => factory) do |file|
      num_records = file.num_records
      file.each do |record|
          tmp_point = Point.new
          tmp_point.lonlatheight = record.geometry.as_text.insert(-2 ," #{record.attributes[:ele.to_s]}")
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
    self.tracksegments.each do |tracksegment|
      tracksegment.create_path_from_points
    end
    track_factory = RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(geo_type: "multiline_string")
    self.path = track_factory.multi_line_string(self.tracksegments.order(:id , :asc).pluck(:tracksegment_path))
    self.save
  end


end
