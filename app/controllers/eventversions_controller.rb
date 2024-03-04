class EventversionsController < ApplicationController

  def index
    @eventversions = Eventversion.where(org_id: params[:org_id]).order("id desc")
  end

  def show

    @event = Eventversion.find(params[:id])
    @event.updated_at = @event.created_at

    render "events/show"
  end

  def restore
    @eventversion = Eventversion.find(params[:version_id])
    @event = Event.find(@eventversion.org_id)
    @event.id = @eventversion.org_id
    @event.update(@eventversion.attributes.except("org_id","id"))
    redirect_to event_path(@event), notice: "Event restored"
  end

  def compare
    @first_id = params[:ids].split(',').first
    @second_id = params[:ids].split(',').second

    @first = Eventversion.find(@first_id).pretty_inspect
    @second = Eventversion.find(@second_id).pretty_inspect
  end

end
