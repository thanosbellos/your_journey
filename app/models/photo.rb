class Photo < ActiveRecord::Base
  belongs_to :trail
  mount_uploader :image, ImageUploader
end
