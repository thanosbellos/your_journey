require 'rails_helper'

feature 'Home page' do

  scenario 'a user can sign up' do
    visit root_path

    find('#sign_up_form').fill_in 'Email', with:'thanos@me.com'
    find('#sign_up_form').fill_in 'Password', with:'foobar123'
    find('#sign_up_form').fill_in 'Password confirmation', with:'foobar123'

    expect { click_link_or_button 'Sign up' }.to change(User, :count)
    expect(page).to have_content('Welcome! You have signed up successfully.')


  end

  scenario 'a user cannot sign up if email is already taken' do

  visit root_path

  user = create(:user)
  find('#sign_up_form').fill_in 'Email',with:user.email
  find('#sign_up_form').fill_in 'Password' , with:'anythingvalid'
  find('#sign_up_form').fill_in 'Password confirmation' , with:'anythingvalid'

  expect{click_link_or_button 'Sign up' } .not_to change(User, :count)
  expect(page).to have_content("* Emailhas already been taken")

  end

  scenario 'a user can log out' do
    visit root_path

    user = create(:user)
    find('#sign_in_form').fill_in 'Email',with: user.email
    find('#sign_in_form').fill_in 'Password' , with: user.password

    click_button 'Log in'
    click_link 'Sign out'
    expect(page).to have_content('Signed out successfully.')

  end

  scenario 'a registered user can login from home page' do

    visit root_path
    user = create(:user)
    find('#sign_in_form').fill_in 'Email' , with: user.email

    find('#sign_in_form').fill_in 'Password' , with: user.password
    click_button 'Log in'
    expect(page).to have_content('Signed in successfully.')
  end

  scenario 'a user cannot login with invalid password' do
    #a blank password is considered as an invalid password
    #
    visit root_path

    user = create(:user)
    find('#sign_in_form').fill_in 'Email', with: user.email
    find('#sign_in_form').fill_in 'Password' , with:'foobarinvalid'
    click_button 'Log in'
    expect(page).to have_content('Invalid email or password.')

  end

end
