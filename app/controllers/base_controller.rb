class BaseController < ApplicationController

  def index
    @events = Event.where("start > ? AND start < ?", Date.today, Date.today + 7.day)
                   .where(user_id: current_user.id)
                   .order(:start)
    respond_to do |format|
      format.html
    end
  end

end
