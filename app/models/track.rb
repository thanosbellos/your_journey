class Track < ActiveRecord::Base
  belongs_to :trail
  has_many :tracksegments , :dependent => :destroy
  has_many :points , :through => :tracksegments
  mount_uploader :trackgeometry , TrackGeometryUploader

  self.rgeo_factory_generator = RGeo::Geos.factory_generator
  set_rgeo_factory_for_column(:path, RGeo::Geographic.spherical_factory(:srid => 4326))
  #before_save  :process_geometry_files

  private
  def process_geometry_files
    if trackgeometry.present? && trackgeometry_changed?
      parse_points_shp_file
      parse_tracks_shp_file
    end
  end

  def parse_points_shp_file

    

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
