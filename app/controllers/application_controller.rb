class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :configure_permitted_parameters, if: :devise_controller?

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) { |u| u.permit(:email,:avatar,  :password, :password_confirmation ,  :name , {activity_ids: []})}
    devise_parameter_sanitizer.for(:account_update) { |u| u.permit(:email,:avatar,  :password, :password_confirmation , :current_password, :name , {activity_ids: []})}
  end
def after_sign_in_path_for(resource)

  user_path(resource)
end

end
