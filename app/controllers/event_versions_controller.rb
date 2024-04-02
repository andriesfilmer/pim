class EventVersionsController < ApplicationController

  def index
    @event_versions = EventVersion.where(org_id: params[:org_id]).order("id desc")
  end

  def show

    @event = EventVersion.find(params[:id])
    @event.updated_at = @event.created_at

    render "events/show"
  end

  def restore
    @event_version = EventVersion.find(params[:version_id])
    @event = Event.find(@event_version.org_id)
    @event.id = @event_version.org_id
    @event.update(@event_version.attributes.except("org_id","id"))
    redirect_to event_path(@event), notice: "Event restored"
  end

  def compare
    @first_id = params[:ids].split(',').first
    @second_id = params[:ids].split(',').second

    @first = EventVersion.find(@first_id).pretty_inspect
    @second = EventVersion.find(@second_id).pretty_inspect
  end

end
