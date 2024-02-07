class EventsController < ApplicationController

  before_action :set_event, only: %i[ show edit update destroy ]

  def index
    if params[:start] && params[:end]
      # Needs session id to implement.
      @events = Event.where("user_id=?", 1).where("start > ?", params[:start]).where("end < ?", params[:end]).limit 100
    else
      @events = Event.all.order("id desc").limit 10
    end
    respond_to do |format|
      format.html
      format.json { render json: @events }
    end
  end

  def show
    #@event.update(last_read: DateTime.now)

    #respond_to do |format|
    #  format.html
    #  format.json { render json: @event.to_json } # else only id, created_at, updated_at
    #end
  end

  def new
    @event = Event.new
  end

  def edit
  end

  def create
    @event = Event.new(event_params)

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
    add_version(@event)

    end
  end

  def update
    if params[:redirect] == "edit"
      url = edit_event_url(@event)
    else
      url = event_url(@event)
    end

    # Create a copy for versions management.
    add_version(@event)

    respond_to do |format|
      if @event.update(event_params)
        format.html { redirect_to url, notice: "Event was successfully updated." }
        # Turbo-stream actions in this block
        #format.turbo_stream { render turbo_stream: turbo_stream.replace("event_#{@event.id}", @event) }
        format.json { render :show, status: :ok, location: @event }
      else
        format.html { render :edit, status: :unprocessable_entity }
        #format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @event.destroy
    respond_to do |format|
      #format.turbo_stream { flash.now[:notice] = "Turbo event was successfully deleted." }
      format.html { redirect_to events_path, notice: "Event was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  def search
    if params.dig(:event_search).present?
      @events = Event.where('name LIKE ?', "%#{params[:event_search]}%").order(updated_at: :desc)
    else
      @events = []
    end
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.update("events", partial: "events", locals: { events: @events })
        ]
      end
    end
  end

  private

  def add_version(event)
    # Create a copy for versions management.
    @eventversion = Eventversion.new(event_params.except("id","mongo_id", "created_at","updated_at"))
    @eventversion.org_id = event.id
    @eventversion.user_id = event.user_id
    @eventversion.save
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_event
    @event = Event.find(params[:id])
  end

  def event_params
    params.require(:event).permit(:name, :phones, :emails, :addresses, :companies, :websites,
      :name, :birthdate, :notes, :starred)
  end

end
