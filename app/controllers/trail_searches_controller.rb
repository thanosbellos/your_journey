class TrailSearchesController < ApplicationController
  def new
  end

  def index
  end

  def search
    puts params[:lnglat]
    lonlat = params[:lnglat].split(",").map do |coordinate|
      coordinate.to_f
    end
    puts lonlat

    matcher = TrailSearch.new(start_loc: lonlat, radius: params[:radius].to_f)
    @tracks = matcher.search
    if(@tracks.length>0)

      @json = @tracks.map do |track|
       track.to_geojson
      end
      @geojson = @json.first

      @json.each_with_index do | json , index|
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

    puts @geojson



    respond_to do |format|
        format.json { render json:@geojson}
    end


  end
end
