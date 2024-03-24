class BaseController < ApplicationController

  def index
    @user = User.find current_user.id
  end

  def about
    puts "######## about... "
  end
end
