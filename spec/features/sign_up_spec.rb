require 'rails_helper'

feature 'Home page' do

  scenario do

  end

  scenario 'user can sign up from home page' do

    visit root_path
    click_link 'Sign up'

    fill_in 'Email' , with: 'thanos@me.com'
    fill_in 'password' , with:'asdfasdf'
    fill_in 'password confirmation' , with: 'asdfasdf'
    click_button 'Sign up'

    expect(page).to have_content('You have successfully signed up')
  end
end
