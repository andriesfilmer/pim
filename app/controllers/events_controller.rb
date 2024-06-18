class EventsController < ApplicationController

  before_action :set_event, only: %i[ show edit update destroy ]

  def index
    if params[:start] && params[:end]
      # Needs session id to implement.
      @events = Event.where("user_id=?", current_user.id).where("start < ?", params[:end]).where("end > ?", params[:start]).limit 500
    else
      @events = Event.where(user_id: current_user.id).order("id desc").limit 500
    end
    respond_to do |format|
      format.html
      format.json { render json: @events }
    end
  end

  def new
    event_start = params[:start].to_date
    event_end   = params[:end].to_date + 1. day
    @event = Event.new(start: event_start, end: event_end)
  end

  def show
    #@event.update(last_read: DateTime.now)

    redirect_to events_path, alert: "Event does not exists (anymore)" unless @event

    respond_to do |format|
      format.html
      format.json { render json: @event.to_json } # else only id, created_at, updated_at
    end
  end

  def create
    params[:event][:start] = params[:event][:start_date] + " " + params[:event][:start_time]
    params[:event][:end] = params[:event][:end_date] + " " + params[:event][:end_time]
    @event = Event.new(event_params)
    @event.user_id = current_user.id
    Time.zone = params[:event][:tz]

    respond_to do |format|
      if @event.save
        format.html { redirect_to events_path(date: @event.start.strftime("%Y-%m-%d")), notice: "Event was successfully created." }
      else
        format.turbo_stream {
           render turbo_stream: turbo_stream.replace("eventForm", partial: "events/form", locals: { resource: @event })
        }
      end

    # Create a copy for versions management.
    if @event.errors.empty?
     add_version(@event)
    end

    end
  end

  def update
    params[:event][:start] = params[:event][:start_date] + " " + params[:event][:start_time]
    params[:event][:end] = params[:event][:end_date] + " " + params[:event][:end_time]
    Time.zone = params[:event][:tz]

    respond_to do |format|
      if @event.update(event_params)
        flash.now[:notice] = "Event was successfully updated."
        format.html { redirect_to events_path(date: @event.start.strftime("%Y-%m-%d")), notice: "Event was successfully updated." }
      else
        format.turbo_stream {
           render turbo_stream: turbo_stream.replace("eventForm", partial: "events/form", locals: { resource: @event })
        }
      end
    end

    # Create a copy for versions management.
    if @event.errors.empty?
      add_version(@event)
    end

  end

  def destroy
    @event.destroy
    respond_to do |format|
      #format.turbo_stream { flash.now[:notice] = "Turbo event was successfully deleted." }
      format.html { redirect_to events_path, notice: "Event was successfully deleted." }
      format.json { head :no_content }
    end
  end

  def search
    if params.dig(:search).length > 2
      search = "%#{params[:search]}%"
      @events = Event.where("title LIKE ? OR description LIKE ? OR tags LIKE ?", search, search, search)
                     .order(start: :desc).where(user_id: current_user.id)
      cookies[:search] = params[:search]
    else
      @events = []
    end
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.update("calendar", partial: "events", locals: { events: @events })
        ]
      end
    end
  end

  private

  def add_version(event)
    # Create a copy for versions management.
    @event_version = EventVersion.new(event_params.except("id","mongo_id", "created_at","updated_at", "start_date", "start_time", "end_date", "end_time"))
    @event_version.org_id = event.id
    @event_version.user_id = current_user.id
    @event_version.save
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_event
    @event = Event.where(user_id: current_user.id).where(id: params[:id]).take
    redirect_to events_path, alert: "Event does not exists (anymore)" and return if @event.blank?
    Time.zone = @event.tz
  end

  def event_params
    params.require(:event).permit(:title, :notes, :start, :end, :allDay, :tz, :category, :tags)
  end

end
