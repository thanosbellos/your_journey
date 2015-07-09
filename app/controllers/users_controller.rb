class UsersController < ApplicationController
  def show
    @user = User.find(params[:id])
    puts "Breakpoint pagination"
    puts params[:page]
    @trails = @user.trails.best_rated.page params[:page]



  end
end
