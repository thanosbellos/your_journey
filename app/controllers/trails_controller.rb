class TrailsController < ApplicationController
  def index

  end

  def show
    @trail = Trail.find(params[:id])
    @trail_geojson = @trail.to_geojson
    @photos_geojson = Trail::CODER.entity_factory.feature_collection(@trail.photos.map(&:geotag_feature))
    @photos_geojson = Trail::CODER.encode(@photos_geojson)
    @method_name = "trails/show"
    respond_to do |format|
      format.html
      format.json { render json: {trail: @trail_geojson , photos: @photos_geojson} }
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
      locations = JSON.parse(params[:locations])

      factory= RGeo::ActiveRecord::SpatialFactoryStore.instance.factory(:geo_type => "Point", srid: 3857 , sql_type: "geometry(Point,3857)")

      locations.each_with_index do |coordinates, index|

        if coordinates
          params[:trail][:photos_attributes][index][:geotag] = factory.point(coordinates[0], coordinates[1]).as_text
        end


      end




      puts current_user.trails.length

      @photos = @trail.photos.build(trail_params[:photos_attributes])
      puts current_user.trails.length

     respond_to do |format|
       if @trail.save
         format.html
         format.json {render json: {redirect_url: user_trail_path(current_user , @trail)}}
       else
         format.json {render json: [{error:"Photos Cound not be saved"}], :status => 304 }
       end

     end


    else


      @user = current_user

      params[:trail][:name] =  File.basename(trail_params[:trailgeometry].original_filename, ".*") if trail_params[:name].blank?


      @trail = @user.trails.build(trail_params)

      respond_to do |format|
        if @trail.save
          @trail.rate(params[:score], @user)
          @trail.users << @user

          format.html
          format.json { render json: {id: @trail.id , :type => :trail, redirect_url: user_trail_path(current_user , @trail)}}
        else
         format.json {render json: [{error: "Trail could not be saved"}], :status => 304 }

        end

      end


    end

  end



  private
    def trail_params
      params.require(:trail).permit(:name, :start_point, :end_point, :length, :duration, :travel_by,
                                    :difficulty,:trailgeometry,:trailgeometry_cache, :photos_attributes => [:id , :trail_id , :image, :geotag])

    end
end
