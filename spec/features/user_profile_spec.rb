require 'rails_helper'

feature 'User profile' , focus:true do
  scenario 'a facebook registered user can edit his profile info without providing password' do
    user = create(:social_media_user)
    sign_in user
    visit user_path(user)
    click_link 'Edit your profile'
    fill_in 'Name', with: 'newName'
    click_button 'Update'
    expect(page).to have_content "Your account has been updated successfully."
  end

  scenario 'a registered user can add preffered activities through edit profile form' do
    user = create(:social_media_user) #ignore passwords
    #before cleanup so that user does not have any pref activities
    activities = []
    activities << create(:activity , :name => "Hiking")
    activities << create(:activity , :name => "Walking")
    sign_in user
    visit user_path(user)
    click_link 'Edit your profile'
    check 'Hiking'
    check 'Walking'

    #next step check many uctivities and

    click_button 'Update'

    expect(user.activities.size).to change.from(0).to(2)
    expect(page).to have_content("updated successfully.")

  end


end
