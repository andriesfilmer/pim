# frozen_string_literal: true

class EventsController < ApplicationController
  before_action :set_event, only: %i[show edit update destroy]

  def index
    @events = if params[:start] && params[:end]
                # Needs session id to implement.
                Event.where('user_id=?', current_user.id)
                     .where('start < ?', params[:end][0..9])
                     .where('end > ?', params[:start][0..9]).limit 500
              else
                Event.where(user_id: current_user.id).order('id desc').limit 500
              end
    respond_to do |format|
      format.html
      format.json { render json: @events }
    end
  end

  def new
    event_start = params[:start].present? ? params[:start].to_date : Date.today
    event_end   = params[:end].present?   ? params[:end].to_date : Date.today
    @event = Event.new(start: event_start, end: event_end.end_of_day.to_s[0, 16])
  end

  def show
    # @event.update(last_read: DateTime.now)

    redirect_to events_path, alert: 'Event does not exists (anymore)' unless @event

    respond_to do |format|
      format.html
      format.json { render json: @event.to_json } # else only id, created_at, updated_at
    end
  end

  def create
    format_event_dates
    @event = Event.new(event_params)
    @event.user_id = current_user.id
    Time.zone = params[:event][:tz]

    respond_to do |format|
      if @event.save
        format.html do
          redirect_to events_path(date: @event.start.strftime('%Y-%m-%d')), notice: 'Event was successfully created.'
        end
      else
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace('eventForm', partial: 'events/form', locals: { resource: @event })
        end
      end

      # Create a copy for versions management.
      add_version(@event) if @event.errors.empty?
    end
  end

  def update
    format_event_dates
    Time.zone = params[:event][:tz]

    respond_to do |format|
      if @event.update(event_params)
        flash.now[:notice] = 'Event was successfully updated.'
        format.html do
          redirect_to events_path(date: @event.start.strftime('%Y-%m-%d')), notice: 'Event was successfully updated.'
        end
      else
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace('eventForm', partial: 'events/form', locals: { resource: @event })
        end
      end
    end

    # Create a copy for versions management.
    return unless @event.errors.empty?

    add_version(@event)
  end

  def destroy
    @event.destroy
    respond_to do |format|
      # format.turbo_stream { flash.now[:notice] = "Turbo event was successfully deleted." }
      format.html { redirect_to events_path, notice: 'Event was successfully deleted.' }
      format.json { head :no_content }
    end
  end

  def search
    if params[:search].length > 2
      search = "%#{params[:search]}%"
      @events = Event.where('title LIKE ? OR description LIKE ? OR tags LIKE ?', search, search, search)
                     .order(start: :desc).where(user_id: current_user.id)
      cookies[:search] = { value: params[:search], expires: 1.hour }
    else
      @events = []
    end
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.update('calendar', partial: 'events', locals: { events: @events })
        ]
      end
    end
  end

  private

  def format_event_dates
    if params[:event][:allDay] == "1"
      # For all-day events, FullCalendar's end date is exclusive
      # So we add 1 day to make it inclusive for the user
      start_date = Date.parse(params[:event][:start_date])
      end_date = Date.parse(params[:event][:end_date]) + 1.day
      params[:event][:start] = start_date.to_s
      params[:event][:end] = end_date.to_s
    else
      params[:event][:start] = "#{params[:event][:start_date]}  #{params[:event][:start_time]}"
      params[:event][:end] = "#{params[:event][:end_date]}  #{params[:event][:end_time]}"
    end
  end

  def add_version(event)
    # Create a copy for versions management.
    @event_version = EventVersion.new(event_params.except('id', 'mongo_id', 'created_at', 'updated_at', 'start_date',
                                                          'start_time', 'end_date', 'end_time'))
    @event_version.org_id = event.id
    @event_version.user_id = current_user.id
    @event_version.save
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_event
    @event = Event.where(user_id: current_user.id).where(id: params[:id]).take
    redirect_to events_path, alert: 'Event does not exists (anymore)' and return if @event.blank?

    # For all-day events, format as YYYY-MM-DD and subtract 1 day from end (reverse the +1 day from save)
    # Do this for HTML views (edit and show), but not for JSON responses
    if @event.allDay == 1 && (action_name == 'edit' || (action_name == 'show' && request.format.html?))
      @event.start = @event.start.strftime("%Y-%m-%d")
      @event.end = (@event.end.to_date - 1.day).to_s
    end

    Time.zone = @event.tz
  end

  def event_params
    params.require(:event).permit(:title, :notes, :start, :end, :allDay, :tz, :category, :tags)
  end
end
