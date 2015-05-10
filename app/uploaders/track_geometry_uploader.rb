# encoding: utf-8

class TrackGeometryUploader < CarrierWave::Uploader::Base

  # Include RMagick or MiniMagick support:
  # include CarrierWave::RMagick
  # include CarrierWave::MiniMagick
  # Choose what kind of storage to use for this uploader:
  storage :file
  # storage :fog
  after :store,  :convert_to_shp
  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  # Provide a default URL as a default if there hasn't been a file uploaded:
  # def default_url
  #   # For Rails 3.1+ asset pipeline compatibility:
  #   # ActionController::Base.helpers.asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
  #
  #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
  # end


  version :shp_tracks do
  end

  version :shp_track_points do
  end



  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  # def extension_white_list
  #   %w(jpg jpeg gif png)
  # end

  def convert_to_shp(uploaded_file)
      puts "Breakpoint 1****"
      puts self.file.file.match("shp_track")

      if self.version_name # && self.file.file.match(/*.gpx$/)
        puts "Brekpoint 2 ****"
       src = self.file.file

       target_layer = self.version_name.to_s.partition("_").last

       directory = File.dirname(self.file.file)
       current_format = File.extname(src)
       basename = File.basename(src , current_format)

      #unless basename.match(target_layer)
      dst = "#{directory}/#{basename}.shp"
       parameters = []
       parameters << "--config"
       parameters << "GPX_SHORT_NAMES YES"
       parameters << "-fieldTypeToString Datetime"
       parameters << "-overwrite"
       parameters << "-f"
       parameters << '"ESRI Shapefile"'
       parameters << "#{dst}"
       parameters << "#{src}"
       parameters << "#{target_layer}"
       parameters = parameters.flatten.compact.join(" ").strip.squeeze(" ")
      `ogr2ogr #{parameters}`



      end


  end

end
