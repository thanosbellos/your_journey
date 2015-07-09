class User < ActiveRecord::Base
  mount_uploader :avatar , AvatarUploader

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, :omniauthable, :omniauth_providers => [:facebook]

  ratyrate_rater
  has_many :trails
  has_and_belongs_to_many :activities
  has_many :comments

  scope :most_active, -> { joins(:trails).group("users.id").order("count(users.id) DESC")}

  def self.from_omniauth(auth)
     where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
    user.email = auth.info.email
    user.password = Devise.friendly_token[0,20]
    user.name = auth.info.name
    p auth.info.image
    user.remote_avatar_url = auth.info.image
   end


  end

  def total_photos
    self.trails.includes(:photos).count(:photos)
  end
  def total_trails_length
    self.trails.sum(:length)
  end

  def total_trails
    self.trails.count
  end
end
