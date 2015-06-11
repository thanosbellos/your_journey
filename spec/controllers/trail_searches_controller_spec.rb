require 'rails_helper'

RSpec.describe TrailSearchesController, :type => :controller do

  describe "GET new" do
    it "returns http success" do
      get :new
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET index" do
    it "returns http success" do
      get :index
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET search" do
    it "returns http success" do
      get :search
      expect(response).to have_http_status(:success)
    end
  end

end
