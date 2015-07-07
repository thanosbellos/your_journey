class Comment < ActiveRecord::Base
  belongs_to :trail
  belongs_to :user
  validates :body, presence: true, length: { minimum: 4 }
end
