class TrailsController < ApplicationController
  before_action :set_trail, only: [:show, :edit, :update, :destroy]

  respond_to :html

  def index
    @trails = Trail.all
    respond_with(@trails)
  end

  def show
    respond_with(@trail)
  end

  def new
    @trail = Trail.new
    respond_with(@trail)
  end

  def edit
  end

  def create
    @trail = Trail.new(trail_params)
    @trail.save
    respond_with(@trail)
  end

  def update
    @trail.update(trail_params)
    respond_with(@trail)
  end

  def destroy
    @trail.destroy
    respond_with(@trail)
  end

  private
    def set_trail
      @trail = Trail.find(params[:id])
    end

    def trail_params
      params.require(:trail).permit(:start, :destination, :travel_by, :rating)
    end
end
