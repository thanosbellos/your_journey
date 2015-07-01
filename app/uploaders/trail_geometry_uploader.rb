
class TrailGeometryUploader < CarrierWave::Uploader::Base

  # Include RMagick or MiniMagick support:
  # include CarrierWave::RMagick
  # include CarrierWave::MiniMagick
  include CarrierWave::MimeTypes


  process :set_content_type

  def extension_white_list
    %w(gpx json)
  end

  def whitelist_mime_type_pattern
    /application\/[json|gpx+xml]/
  end
  # Choose what kind of storage to use for this uploader:
  storage :file
  # storage :fog
  #
  after :store, :convert_to_shp

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end



  version :shp_trail do
    def full_filename(for_file = model.source.file)
      super.chomp(File.extname(super)) + '.shp'
    end
  end

  #version :shp_track_points do
  #def full_filename(for_file = model.source.file)
  #super.chomp(File.extname(super)) + '.shp'
  #end

  #end



  def convert_to_shp(uploaded_file)


    current_format = File.extname(self.file.file)
    if self.version_name


      content_type =  self.file.content_type.match(/gpx|json|kml/)[0]
      puts content_type


      puts "Breakpoint ********* 76"
      puts current_format
      puts self.file.file
      puts self.file


      src = self.file.file

      directory = File.dirname(self.file.file)

      tmpfile_name = "tempfile.#{content_type}"
      tmpfile = File.join(directory, tmpfile_name)
      sf = self.file.copy_to(tmpfile)


      basename = File.basename(src , current_format)
      #unless basename.match(target_layer)
      tmpdir = Dir.mktmpdir("out")

      dst = "#{tmpdir}/#{basename}.shp"
      parameters = []

      case content_type
      when "gpx"
        parameters << "--config"
        parameters << "GPX_SHORT_NAMES YES"
        parameters << "-fieldTypeToString Datetime"
        parameters << "-overwrite"
        parameters << "-f"
        parameters << '"ESRI Shapefile"'
        parameters << "#{dst}"
        parameters << "#{tmpfile}"
        parameters << "tracks"
        parameters = parameters.flatten.compact.join(" ").strip.squeeze(" ")
        puts      `ogr2ogr #{parameters}`
      when "kml"
      when "json"

        parameters << "-f"
        parameters << '"ESRI Shapefile"'
        parameters << "#{dst}"
        parameters << "#{tmpfile}"
        parameters << "OGRGeoJSON"
        parameters = parameters.flatten.compact.join(" ").strip.squeeze(" ")

        puts      `ogr2ogr #{parameters}`

      end

      Dir.glob("#{tmpdir}/shp*") do |filename|
        if filename.match("^*.shp$")

          real_shp_file = File.open(filename)
          File.write(src , File.read(real_shp_file))
          real_shp_file.close
          File.unlink(real_shp_file)
        else
          FileUtils.cp(filename , directory)
        end
      end
      File.unlink(tmpfile)
      FileUtils.rmdir("#{directory}/out")


    end
  end


  # Provide a default URL as a default if there hasn't been a file uploaded:
  # def default_url
  #   # For Rails 3.1+ asset pipeline compatibility:
  #   # ActionController::Base.helpers.asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
  #
  #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
  # end

  # Process files as they are uploaded:
  # process :scale => [200, 300]
  #
  # def scale(width, height)
  #   # do something
  # end

  # Create different versions of your uploaded files:
  # version :thumb do
  #   process :resize_to_fit => [50, 50]
  # end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  # def extension_white_list
  #   %w(jpg jpeg gif png)
  # end

  # Override the filename of the uploaded files:
  # Avoid using model.id or version_name here, see uploader/store.rb for details.
  # def filename
  #   "something.jpg" if original_filename
  # end

end
