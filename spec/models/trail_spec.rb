require 'rails_helper'

RSpec.describe Trail, :type => :model, focus: true do
  it "has a valid factory" do
    expect(FactoryGirl.build(:trail)).to be_valid
  end

  it "is invalid without a travel_by mean " do
    trail = build(:trail , travel_by: nil)
    trail.valid?
    expect(trail.errors[:travel_by]).to include("can't be blank")
  end

  it "is invalid without a starting point" do
    trail = build(:trail , start: nil)
    trail.valid?
    expect(trail.errors[:start]).to include("can't be blank")
  end

  it "is invalid without a name" do
    trail = build(:trail , name:nil)
    trail.valid?
    expect(trail.errors[:name]).to include("can't be blank")
  end
end
