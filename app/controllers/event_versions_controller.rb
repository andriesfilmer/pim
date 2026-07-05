class EventVersionsController < ApplicationController

  def index
    @event_versions = EventVersion.where(org_id: params[:org_id], user_id: current_user.id).order("id desc")
  end

  def show

    @event = EventVersion.where(id: params[:id], user_id: current_user.id).take!
    @event.updated_at = @event.created_at

    render "events/show"
  end

  def restore
    @event_version = EventVersion.where(id: params[:version_id], user_id: current_user.id).take!
    @event = Event.where(id: @event_version.org_id, user_id: current_user.id).take!
    @event.update(@event_version.attributes.except("org_id", "id", "user_id"))
    redirect_to event_path(@event), notice: "Event restored"
  end

  def compare
    @first_id = params[:ids].split(',').first
    @second_id = params[:ids].split(',').second

    @first = EventVersion.where(id: @first_id, user_id: current_user.id).take!.pretty_inspect
    @second = EventVersion.where(id: @second_id, user_id: current_user.id).take!.pretty_inspect
  end

end
