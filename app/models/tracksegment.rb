class Tracksegment < ActiveRecord::Base

  belongs_to :track
  has_many :points, :dependent => :destroy

  self.set_rgeo_factory_for_column(:tracksegment_path , RGeo::Geographic.spherical_factory(:srid => 4326))


  def set_path_from_points

  end
end
