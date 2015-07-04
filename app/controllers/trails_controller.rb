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

      @trail = Trail.find(params[:hidden_trail_id])
      @trail.photos.build(trail_params[:photos_attributes])

     respond_to do |format|
       if @trail.save
         format.html
         format.json {render json: {redirect_url: user_trail_path(current_user , @trail)}}
       end
     end


    else


      @user = current_user

      params[:trail][:name] =  File.basename(trail_params[:trailgeometry].original_filename, ".*") if trail_params[:name].blank?


      @trail = @user.trails.create(trail_params)

      respond_to do |format|
        if @trail.save
          @trail.rate(params[:score], @user)
          @trail.users << @user

          format.html
          format.json { render json: {id: @trail.id , :type => :trail, redirect_url: user_trail_path(current_user , @trail)}}
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
