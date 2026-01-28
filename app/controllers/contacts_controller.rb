class ContactsController < ApplicationController
  before_action :set_contact, only: %i[show edit update destroy]

  def index
    @contacts = Contact.where(user_id: current_user.id).order('last_read desc').limit 500
    @contacts = @contacts.where(starred: true) if params[:starred]
    @contacts = @contacts.by_birthdate if params[:birthdate]
  end

  def show
    @contact.update_column(:last_read, DateTime.now)
  end

  def new
    @contact = Contact.new
  end

  def edit
  end

  def create
    @contact = Contact.new(contact_params)
    @contact.user_id = current_user.id

    respond_to do |format|
      if @contact.save
        format.html { redirect_to @contact, notice: 'Contact was successfully created.' }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace('contactForm', partial: 'contacts/form', locals: { resource: @contact })
        end
      end

      # Create a copy for versions management.
      add_version(@contact)
    end
  end

  def update
    respond_to do |format|
      if @contact.update(contact_params)
        # format.html { redirect_to contact_url(@contact), notice: "Contact was successfully updated." }
        format.html { redirect_to contact_url(@contact), flash: { success: 'Contact was successfully updated' } }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace('contactForm', partial: 'contacts/form', locals: { resource: @contact })
        end
      end
    end

    # Create a copy for versions management.
    return unless @contact.errors.empty?

    add_version(@contact)
  end

  def destroy
    @contact.destroy
    respond_to do |format|
      # format.turbo_stream { flash.now[:notice] = "Turbo contact was successfully deleted." }
      format.html { redirect_to contacts_path, notice: 'Contact was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  def search
    if params.dig(:search).present?
      search = "%#{params[:search]}%"
      @contacts = Contact.where('name LIKE ? OR notes LIKE ? OR tags LIKE ?', search, search, search)
                         .where(user_id: current_user.id).order(updated_at: :desc)
      cookies[:search] = { value: params[:search], expires: 1.hour, httponly: true, secure: Rails.env.production? }
    else
      @contacts = []
    end
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.update('contacts', partial: 'contacts', locals: { contacts: @contacts })
        ]
      end
    end
  end

  private

  def add_version(contact)
    # Create a copy for versions management.
    @contact_version = ContactVersion.new(contact_params.except('id', 'mongo_id', 'created_at', 'updated_at'))
    @contact_version.org_id = contact.id
    @contact_version.user_id = contact.user_id
    @contact_version.save
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_contact
    @contact = Contact.where(id: params[:id]).where(user_id: current_user.id).take
  end

  def contact_params
    params.require(:contact).permit(:name, :phones, :emails, :addresses, :companies, :websites,
                                    :name, :birthdate, :notes, :tags, :starred)
  end
end
