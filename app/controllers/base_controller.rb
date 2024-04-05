class BaseController < ApplicationController

  def index
    @user = User.find current_user.id
    @events = Event.where("start > ?", DateTime.now).where("start < ?", DateTime.now + 14.day)
                   .where(user_id: current_user.id).order(start: :desc)
  end

end
