class TrailsController < ApplicationController
  def index

  end

  def new
    @trail = Trail.new
  end

  def create
    @trail = Trail.new(trail_params)
    p @trail
    if @trail.save
      render 'show'
    else
      p @trail.errors.full_messages
      render 'new'
    end
  end


  private
    def trail_params
      params.require(:trail).permit(:name , :start_point , :end_point , :length , :duration , :travel_by , :difficulty , :rating )
    end
end
