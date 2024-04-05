# NOT USED FOR NOW, but saved as example
#
# Add to routes:  devise_for :users, controllers: { registrations: 'registrations' }

class RegistrationsController < Devise::RegistrationsController
  before_action :configure_account_update_params, only: [:update]

  protected

  # Add password checking to account update parameters
  def configure_account_update_params
    devise_parameter_sanitizer.permit(:account_update, keys: [:name, :email, :password, :password_confirmation, :current_password])
  end

  # Override the update_resource method to require the current password when the email is changed
  def update_resource(resource, params)
    if params[:email] != resource.email
      resource.update_with_password(params)
    else
      resource.update_without_password(params.except(:current_password))
    end
  end
end
