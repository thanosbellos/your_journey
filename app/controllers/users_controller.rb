class UsersController < ApplicationController
  def show
    @user = User.find(params[:id])
    @trails = @user.trails.best_rated.first(5)

  end
end
