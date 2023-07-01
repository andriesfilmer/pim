class ContactversionsController < ApplicationController

  def index
    @contactversions = Contactversion.where(org_id: params[:org_id]).order("id desc")
  end

  def show

    @contact = Contactversion.find(params[:id])
    @contact.updated_at = @contact.created_at

    render "contacts/show"
  end

  def restore
    @contactversion = Contactversion.find(params[:version_id])
    @contact = Contact.find(@contactversion.org_id)
    @contact.id = @contactversion.org_id
    @contact.update(@contactversion.attributes.except("org_id","id"))
    respond_to do |format|
      format.html { redirect_to contact_path(@contact), notice: "Contact restored" }
    end
  end

  def compare
    @first_id = params[:ids].split(',').first
    @second_id = params[:ids].split(',').second

    @first = Contactversion.find(@first_id).pretty_inspect
    @second = Contactversion.find(@second_id).pretty_inspect
  end

end
