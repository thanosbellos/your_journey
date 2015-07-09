class UsersController < ApplicationController
  def show

    @user = User.find(params[:id])
    @trails = @user.trails.best_rated.page params[:page]



  end
end
