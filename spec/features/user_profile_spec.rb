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

    activities = [ create(:activity , :name => "Hiking") , create(:activity , :name => "Walking")]
    sign_in user
    visit user_path(user)
    click_link 'Edit your profile'
    check 'Hiking'
    check 'Walking'

    expect {

      click_button 'Update'
    }.to change(user.activities , :count).by(2)

    expect(page).to have_content("updated successfully.")
    visit user_path(user)
    expect(page).to have_content("Hiking")
    expect(page).to have_content("Walking")
  end

  scenario ' a registered user can remove preffered activities when editing his profile' do
    user = build(:social_media_user)
    activities = [ create(:activity , :name => "Hiking") , create(:activity , :name => "Walking")]
    user.activities = activities
    user.save
    sign_in user
    visit edit_user_registration_path(user)
    uncheck 'Hiking'


   expect {
      click_button 'Update'
    }.to change(user.activities , :count).by(-1)



    expect(page).to have_content("updated successfully.")
    visit user_path(user)
    expect(page).to have_content("Walking")
    expect(page).to_not have_content("Hiking")
  end



end
