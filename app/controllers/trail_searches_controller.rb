class TrailSearchesController < ApplicationController
  def new
  end

  def index
  end

  def search

    origin_lonlat = params[:origin_lnglat].split(",").map do |coordinate|
      coordinate.to_f
    end


    if(params[:destination_lnglat]!="")
        destination_lonlat = params[:destination_lnglat].split(",").map do |coordinate|
          coordinate.to_f
        end
    end

    if(params[:sample_route]!= "")
      sample_route = params[:sample_route]
    end

    matcher = TrailSearch.new(start_loc: origin_lonlat,
                              radius: params[:radius].to_f,
                              finish_loc: destination_lonlat,
                              sample_route: sample_route)
    tracks = matcher.search
    puts tracks.length
    if(tracks.length>0)

      json = tracks.map do |track|
       track.to_geojson
      end
      @geojson = json.first

      json.each_with_index do | json , index|
       unless(index ==0)
         @geojson.merge!(json) do |key, oldval ,newval|
            if(key=="features")

               (oldval << newval).flatten!
            else
              (oldval)
            end
         end
       end

      end
    else
      @geojson = {"message": "Unfortunately there are no trails in that radius"}
    end




    respond_to do |format|
        format.json { render json:@geojson}
    end


  end
end
