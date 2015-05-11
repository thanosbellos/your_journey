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
    def full_filename(for_file = model.source.file)
      super.chomp(File.extname(super)) + '.shp'
    end
  end

  version :shp_track_points do
    def full_filename(for_file = model.source.file)
      super.chomp(File.extname(super)) + '.shp'
    end

  end




  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  # def extension_white_list
  #   %w(jpg jpeg gif png)
  # end

  def convert_to_shp(uploaded_file)

    current_format = File.extname(self.file.file)
    if self.version_name


      #source_format find content type and set source_format to gpx or json
      target_layer = self.version_name.to_s.partition("_").last
      src = self.file.file
      directory = File.dirname(self.file.file)

      tmpfile = File.join(directory, 'tmpfile.gpx')
      sf = self.file.copy_to(tmpfile)
      puts sf.file
      puts "Breakpoint"
      p tmpfile


      basename = File.basename(src , current_format)
      #unless basename.match(target_layer)
      tmpdir = Dir.mktmpdir("out")

      dst = "#{tmpdir}/#{basename}.shp"
      puts dst
      parameters = []
      parameters << "--config"
      parameters << "GPX_SHORT_NAMES YES"
      parameters << "-fieldTypeToString Datetime"
      parameters << "-overwrite"
      parameters << "-f"
      parameters << '"ESRI Shapefile"'
      parameters << "#{dst}"
      parameters << "#{tmpfile}"
      parameters << "#{target_layer}"
      parameters = parameters.flatten.compact.join(" ").strip.squeeze(" ")
      puts      `ogr2ogr #{parameters}`

      Dir.glob("#{tmpdir}/shp*") do |filename|
        puts "BREAkopoint"
        puts filename
        if filename.match("^*.shp$")

          real_shp_file = File.open(filename)
          File.write(src , File.read(real_shp_file))
          real_shp_file.close
          File.unlink(real_shp_file)
        else
            puts "Breakpoint asdlfalsf"
          FileUtils.cp(filename , directory)
        end
      end
      File.unlink(tmpfile)
      FileUtils.rmdir("#{directory}/out")


    end
  end

end
