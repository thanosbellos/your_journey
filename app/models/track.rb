class Track < ActiveRecord::Base
  belongs_to :trail
  has_attached_file :gpx
  validates_attachment_content_type :gpx, :content_type => [/application\/gpx\+xml/,  /application\/xml/]

before_post_process on: :create do
  puts gpx_content_type
  puts "asdf lalalalalalla break 4"
  if gpx_content_type == 'application/octet-stream'
    mime_type = MIME::Types.type_for(gpx_file_name)
    self.gpx_content_type = mime_type.first.to_s if mime_type.first
  end
  puts self.gpx_content_type
end
end
