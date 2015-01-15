module LoginMacros
  def sign_in(user)
    visit root_path
    find('#sign_in_form').fill_in 'Email',with: user.email
    find('#sign_in_form').fill_in 'Password' , with: user.password
    click_button 'Log in'
  end
end
