require 'rails_helper'

feature 'trails management', focus:true do

  scenario 'a user can add new trail from his profile' do
    user = create(:user)
    sign_in user
    visit user_path(user)

    click_link 'Add Trail'
    expect(page).not_to have_content "Trip to Metsovo"
    fill_in "Driving distance" , with:"30"
    fill_in "Length" , with:"2"
    fill_in "Start point" , with:"Ioannina"
    fill_in "End poing " , with:"Metsovo"
    fill_in "Travel on" , with:"Car"
    click_button "Create route"

    expect(current_path).to eq user_trails_path
    expect(page).to have_content "Successfully created a new route."
    expect(page).to have_content "Trip to Metsovo"

  end
end
