class TrailsController < ApplicationController
  def index

  end

  def show
    @trail = Trail.find(params[:id])
    @track = @trail.track
    @geojson = Array.new
    @geojson = @track.to_geojson
    @method_name = "trails//show"
    respond_to do |format|
      format.html
      format.json { render json: @geojson}
    end
  end

  def new
    @user = current_user
    @trail = @user.trails.new
    @trail.track = Track.new

    @method_name ="trails/new"
  end

  def create
    @trail = current_user.trails.new(trail_params)
    @user = current_user
    if @trail.save

      @trail.users << @user
      redirect_to [@user , @trail]
      flash[:notice] = "Successfully created a new route."
    else
      render  'new'
    end
  end

  private
    def trail_params
      params.require(:trail).permit(:name , :start_point , :end_point , :length , :duration , :travel_by , :difficulty , :rating , track_attributes: [:trackgeometry, :trackegeometry_cache])
    end
end
