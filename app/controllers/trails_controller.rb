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

    if(trail_params[:photos_attributes])

      puts "Breakpoint"
      puts params[:hidden_trail_id]


    else

      @user = current_user
      @trail = @user.trails.new(trail_params)


      respond_to do |format|
        if @trail.save
          @trail.rate(params[:score], @user)
          @trail.users << @user

          format.html
          format.json { render json: {id: @trail.id , :type => :trail}}
        end

      end


    end

  end



  private
    def trail_params
      params.require(:trail).permit(:name, :start_point, :end_point, :length, :duration, :travel_by,
                                    :difficulty,:trailgeometry,:trailgeometry_cache, :photos_attributes => [:id , :trail_id , :image])

    end
end
