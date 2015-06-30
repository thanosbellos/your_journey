class UsersController < ApplicationController
  def show
    @trails = current_user.trails.first(5)
  end
end
