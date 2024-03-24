class EventsController < ApplicationController

  before_action :set_event, only: %i[ show edit update destroy ]

  def index
    if params[:start] && params[:end]
      # Needs session id to implement.
      @events = Event.where("user_id=?", current_user.id).where("start > ?", params[:start]).where("end < ?", params[:end]).limit 100
    else
      @events = Event.where(user_id: current_user.id).order("id desc").limit 10
    end
    respond_to do |format|
      format.html
      format.json { render json: @events }
    end
  end

  def new
    @event = Event.new(start: params[:start], end: params[:end])
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
        format.html { redirect_to @event, notice: "Event was successfully created." }
        # Turbo-stream actions in separate file update.turbo_stream.erb
        #format.turbo_stream { flash.now[:notice] = "Turbo event was successfully created." }
        #format.json { render :show, status: :created, location: @event } and return
      else
        format.html { render :new, status: :unprocessable_entity }
        #format.json { render json: @event.errors, status: :unprocessable_entity }
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
        format.html { redirect_to events_path, notice: "Event was successfully updated." }
        # Turbo-stream actions in this block
        #format.turbo_stream { render turbo_stream: turbo_stream.replace("event_#{@event.id}", @event) }
        format.json { render :show, status: :ok, location: @event }
      else
        format.html { render :edit, status: :unprocessable_entity }
        #format.json { render json: @event.errors, status: :unprocessable_entity }
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
    if params.dig(:event_search).present?
      search = "%#{params[:event_search]}%"
      @events = Event.where("title LIKE ? OR notes LIKE ? OR tags LIKE ?", search, search, search)
                     .order(updated_at: :desc).where(user_id: current_user.id)
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
    @eventversion = Eventversion.new(event_params.except("id","mongo_id", "created_at","updated_at", "start_date", "start_time", "end_date", "end_time"))
    @eventversion.org_id = event.id
    @eventversion.user_id = current_user.id
    @eventversion.save
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_event
    @event = Event.where(user_id: current_user.id).where(id: params[:id]).take
    redirect_to events_path, alert: "Event does not exists (anymore)" and return if @event.blank?
    Time.zone = @event.tz
  end

  def event_params
    params.require(:event).permit(:title, :notes, :start, :end, :allday, :tz, :classNames, :tags)
  end

end
