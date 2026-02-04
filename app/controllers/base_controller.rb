class BaseController < ApplicationController

  def index
    @user = User.find current_user.id
    @events = Event.where("(start >= ? AND start <= ?) OR (end >= ? AND end <= ?)",
     Date.today, Date.today + 14.day, Date.today, Date.today + 14.day)
      .where(user_id: current_user.id).order(start: :asc)
  end

  def update_offline_data
    current_user.update(offline_data: params[:offline_data] == 'true')
    render json: { offline_data: current_user.offline_data }
  end

end
