class ContactVersionsController < ApplicationController

  def index
    @contact_versions = ContactVersion.where(org_id: params[:org_id], user_id: current_user.id).order("id desc")
  end

  def show

    @contact = ContactVersion.where(id: params[:id], user_id: current_user.id).take!
    @contact.updated_at = @contact.created_at

    render "contacts/show"
  end

  def restore
    @contact_version = ContactVersion.where(id: params[:version_id], user_id: current_user.id).take!
    @contact = Contact.where(id: @contact_version.org_id, user_id: current_user.id).take!
    @contact.update(@contact_version.attributes.except("org_id", "id", "user_id"))
    redirect_to contact_path(@contact), notice: "Contact restored"
  end

  def compare
    @first_id = params[:ids].split(',').first
    @second_id = params[:ids].split(',').second

    @first = ContactVersion.where(id: @first_id, user_id: current_user.id).take!.pretty_inspect
    @second = ContactVersion.where(id: @second_id, user_id: current_user.id).take!.pretty_inspect
  end

end
