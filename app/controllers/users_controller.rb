class UsersController < ApplicationController
  def show
    @user = User.find(params[:id])
    @trails = @user.trails

  end
end
