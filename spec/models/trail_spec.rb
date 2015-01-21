require 'rails_helper'

RSpec.describe Trail, :type => :model, focus: true do

  it "is invalid without a name" do
    trail = build(:trail , name:nil)
    trail.valid?
    expect(trail.errors[:name]).to include("can't be blank")
  end

  it "is invalid without a starting point" do
    trail = build(:trail , start_point: nil)
    trail.valid?
    expect(trail.errors[:start_point]).to include("can't be blank")
  end

  it "is invalid without a travel_by mean " do
    trail = build(:trail , travel_by: nil)
    trail.valid?
    expect(trail.errors[:travel_by]).to include("can't be blank")
  end

  it "is invalid with a non number rating" do
    trail = build(:trail , rating:"NaN")
    trail.valid?
    expect(trail.errors[:rating]).to include("is not a number")
  end

  it "is invalid with a float number as rating" do
    trail = build(:trail , rating:1.5 )
    trail.valid?
    expect(trail.errors[:rating]).to include("must be an integer")
  end

  it "is invalid with a rating greater than 5" do
    trail = build(:trail , rating:6)
    trail.valid?
    expect(trail.errors[:rating]).to include("must be less than or equal to 5")
  end

  it "is invalid with a rating lower than 1" do
    trail = build(:trail , rating:-1)
    trail.valid?
    expect(trail.errors[:rating]).to include("must be greater than or equal to 1")
  end

  it "has a valid factory" do
     expect(FactoryGirl.build(:trail)).to be_valid
  end

end
