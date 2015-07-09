class UsersController < ApplicationController
  def index

    @users =  User.all.include(:trails)

  end

  def show
    @user = User.find(params[:id])
    @trails = @user.trails.best_rated.page params[:page]
  end
end
