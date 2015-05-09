module CarrierWave
  module ShapeProcessor
    def convert_to_shp
       src = current_path
       dst = Dir.mktmpdir('out')

       parameters = []
       parameters << "--config"
       parameters << "GPX_SHORT_NAMES YES"
       parameters << "-fieldTypeToString Datetime"
       parameters << "-overwrite"
       parameters << "#{dir}"
       parameters << "#{File.expand_path(src.path)}"
       dst

    end
  end
end
