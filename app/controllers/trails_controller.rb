class TrailsController < ApplicationController
  def index

  end

  def show
    @trail = Trail.find(params[:id])
    @geojson = Array.new
    @geojson = @trail.to_geojson
    @method_name = "trails/show"
    respond_to do |format|
      format.html
      format.json { render json: @geojson}
    end
  end

  def new
    @user = current_user
    @trail = @user.trails.new
    @trail.photos.build
    @method_name ="trails/new"

  end

  def create


    @user = current_user
    @trail = @user.trails.new(trail_params)



   if @trail.save

      @trail.rate(params[:score], @user )
      @trail.users << @user
      redirect_to [@user , @trail]
      flash[:notice] = "Successfully created a new route."

    else
      render  'new'
    end
  end

  private
    def trail_params
      params.require(:trail).permit(:name, :start_point, :end_point, :length, :duration, :travel_by,
                                    :difficulty,:trailgeometry,:trailgeometry_cache, :photos_attributes => [:id , :trail_id , :image])

    end
end
