require 'rails_helper'

feature 'trails management', focus:true do

  scenario 'a user can add new trail from his profile' do
    user = create(:user)
    sign_in user
    visit user_path(user)

    click_link 'Add Trail'
    expect(page).not_to have_content "Trip to Metsovo"
    fill_in "Length" , with:"30"
    fill_in "Duration" , with:"2.5"
    fill_in "Start point" , with:"Ioannina"
    fill_in "End point" , with:"Metsovo"
    fill_in "Travel by" , with:"Car"
    click_button "Create route"

    expect(current_path).to eq user_trails_path
    expect(page).to have_content "Successfully created a new route."
    expect(page).to have_content "Trip to Metsovo"

  end
end
