class UsersController < ApplicationController
  def show
    @trails = current_user.trails.best_rated.first(5)
  end
end
