class Track < ActiveRecord::Base
  belongs_to :trail
  has_attached_file :gpx
  validates_attachment_content_type :gpx, :content_type => [/application\/gpx\+xml/,  /application\/xml/]
  has_many :tracksegments , :dependent => :destroy
  has_many :points , :through => :tracksegments
  before_save :parse_file

  before_post_process on: :create do
     if gpx_content_type == 'application/octet-stream'
        mime_type = MIME::Types.type_for(gpx_file_name)
        self.gpx_content_type = mime_type.first.to_s if mime_type.first
     end
  end
  self.rgeo_factory_generator = RGeo::Geos.factory_generator
  set_rgeo_factory_for_column(:path, RGeo::Geographic.spherical_factory(:srid => 4326))

  def parse_file
    tempfile = gpx.queued_for_write[:original]
    doc = Nokogiri::XML(tempfile)
    parse_xml(doc)
  end

  def parse_xml(doc)
    doc.root.elements.each do |node|
      parse_tracks(node)
    end
  end

  def parse_tracks(node)
    track_factory = Track.rgeo_factory_for_column(:path)
    if node.node_name.eql? 'trk'
      node.elements.each do |node|
        parse_track_segments(node)
      end
    end
    self.path = track_factory.multi_line_string(self.tracksegments.pluck(:tracksegment_path))
  end

  def parse_track_segments(node)
    segment_factory = Tracksegment.rgeo_factory_for_column(:tracksegment_path)

    if node.node_name.eql? 'trkseg'

      tmp_segment = Tracksegment.new
      node.elements.each do |node|
        parse_points(node,tmp_segment)
      end
      tmp_segment.tracksegment_path = segment_factory.line_string(tmp_segment.points.pluck(:lonlatheight))
      self.tracksegments << tmp_segment

    end
  end

  def parse_points(node,tmp_segment)

    if node.node_name.eql? 'trkpt'
      lonlatheight_factory = Point.rgeo_factory_for_column(:lonlatheight)
      tmp_point = Point.new

      latitude = node.attr("lat").to_f
      longitude = node.attr("lon").to_f

      elevation = 0
      node.elements.each do |node|
        tmp_point.name = node.text.to_s if node.name.eql? 'name'
        elevation = node.text.to_s.to_f if node.name.eql? 'ele'
       # tmp_point.description = node.text.to_s if node.name.eql? 'desc'
       # tmp_point.point_created_at = node.text.to_s if node.name.eql? 'time'
      end

      p [latitude , longitude, elevation]
      tmp_point.lonlatheight = lonlatheight_factory.point(longitude , latitude , elevation)
      tmp_segment.points << tmp_point
    end

  end



end
