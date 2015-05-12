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
  #before_save  :process_geometry_files

  private
  def process_geometry_files
    if trackgeometry.present? && trackgeometry_changed?
      parse_points_shp_file
      parse_tracks_shp_file
    end

  end

  def find_srid_from_prj(layer_file)

    #for_layer is the file path to points or tracks etc
    extension = File.extname(layer_file)
    basename =  File.basename(layer_file , extension)
    prj_file = basename + ".prj"
    srid = "4326"
    srid_text =  "to_be_filled"

    if File.exist?(prj_file)
      File.open(prj_file) do |file|
        srid_text = file.read
      end
      file.rewind
    end

    query_url = "http://prj2epsg.org/search.json?terms="+srid_text
    puts query_url
    r = open(query_url)
    data = JSON.load(r)

    srid = data["codes"][0]["code"] if r.status[1] == "OK"



  end

  def parse_points_shp_file


    f = trackgeometry.shp_track_points.path

   srid = find_srid_from_prj(f)
   factory = RGeo::Geographic.spherical_factory(:srid =>4326)
   RGeo::Shapefile::Reader(f,factory) do |file|
      file.each do |record|

      end

    end

  end

  def create_path_from_segments
    self.tracksegments.each do |tracksegment|
      tracksegment.create_path_from_points
    end
    track_factory = Track.rgeo_factory_for_column(:path)
    self.path = track_factory.multi_line_string(self.tracksegments.pluck(:tracksegment_path))
    self.save
  end


end
