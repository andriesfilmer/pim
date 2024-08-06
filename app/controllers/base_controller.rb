class BaseController < ApplicationController

  def index
    @user = User.find current_user.id
    @events = Event.where("(start >= ? AND start <= ?) OR (end >= ? AND end <= ?)",
     Date.today, Date.today + 14.day, Date.today, Date.today + 14.day)
      .where(user_id: current_user.id).order(start: :asc)
  end

end
