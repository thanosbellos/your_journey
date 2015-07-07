class User < ActiveRecord::Base
  mount_uploader :avatar , AvatarUploader

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, :omniauthable, :omniauth_providers => [:facebook]

  ratyrate_rater
  has_and_belongs_to_many :trails
  has_and_belongs_to_many :activities
  has_many :comments

  def self.from_omniauth(auth)
     where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
    user.email = auth.info.email
    user.password = Devise.friendly_token[0,20]
    user.name = auth.info.name
    p auth.info.image
    user.remote_avatar_url = auth.info.image
   end

  end
end
