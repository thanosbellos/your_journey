class PhotosController < ApplicationController
  def new
  end

  def show

  end

  def create
  end

  def index
    trail = Trail.find(params[:trail_id])
    @photos = trail.photos
    render :json => @photos.collect {|p| p.to_jq_upload}.to_json

  end

  def destroy

    @photo = Photo.find(params[:id])
    @photo.destroy
    render :json => true

  end

end
