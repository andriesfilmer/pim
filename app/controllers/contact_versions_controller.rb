class ContactVersionsController < ApplicationController

  def index
    @contact_versions = ContactVersion.where(org_id: params[:org_id]).order("id desc")
  end

  def show

    @contact = ContactVersion.find(params[:id])
    @contact.updated_at = @contact.created_at

    render "contacts/show"
  end

  def restore
    @contact_version = ContactVersion.find(params[:version_id])
    @contact = Contact.find(@contact_version.org_id)
    @contact.id = @contact_version.org_id
    @contact.update(@contact_version.attributes.except("org_id","id"))
    redirect_to contact_path(@contact), notice: "Contact restored"
  end

  def compare
    @first_id = params[:ids].split(',').first
    @second_id = params[:ids].split(',').second

    @first = ContactVersion.find(@first_id).pretty_inspect
    @second = ContactVersion.find(@second_id).pretty_inspect
  end

end
