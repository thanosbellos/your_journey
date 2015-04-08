class Track < ActiveRecord::Base
  has_attached_file :gpx
  validates_attachment_content_type :gpx, :content_type => /\Agpx*\Z/

  belongs_to :trail
end
