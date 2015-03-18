require 'rails_helper'

feature 'User profile' , focus:true do
  scenario 'a user can edit his profile' do
    user = create(:user)
    sign_in user
    visit user_path(user)
    click_link 'Edit your profile'
  end


end
