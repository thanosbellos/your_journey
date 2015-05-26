class TrailsController < ApplicationController
  def index

  end

  def show
    @trail = Trail.find(params[:id])
    @track = @trail.track
    @geojson = Array.new
    @geojson << {
      type: "FeatureCollection",
      features: [
        {
            type: "Feature",
            geometry: RGeo::GeoJSON.encode(@track.merged_path),
            properties:{
            stroke: "#fc4353",
            :"stroke-width" => "5"
            }
      },

        {
            type: "Feature",
            geometry: RGeo::GeoJSON.encode(@track.start),
            properties: {      "title": "Start Point",
                               "description": "Must be a geocoded pos",
                        }

        },

        {
          type: "Feature",
          geometry: RGeo::GeoJSON.encode(@track.finish),
          properties: {      "title": "Finish Point",
                               "description": "Must be an address geocoded by lonlat",
                      }

        }


      ]
    }

    respond_to do |format|
      format.html
      format.json { render json: @geojson}
    end
  end

  def new
    @user = current_user
    @trail = @user.trails.new
    @trail.track = Track.new
  end

  def create
    @trail = current_user.trails.new(trail_params)
    @user = current_user
    if @trail.save

      @trail.users << @user
      redirect_to [@user , @trail]
      flash[:notice] = "Successfully created a new route."
    else
      render 'new'
    end
  end

  private
    def trail_params
      params.require(:trail).permit(:name , :start_point , :end_point , :length , :duration , :travel_by , :difficulty , :rating , track_attributes: [:trackgeometry])
    end
end
