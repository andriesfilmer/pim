class ApplicationController < ActionController::Base
  before_action :authenticate_user!, except: %i[about welcome]
end
