class UsersController < ApplicationController
  def index

    @users =  User.most_active
    puts @users.inspect

  end

  def show
    @user = User.find(params[:id])
    @trails = @user.trails.best_rated.page params[:page]
  end
end
