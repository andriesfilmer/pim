class ContactsController < ApplicationController

  before_action :set_contact, only: %i[ show edit update destroy ]

  def index
    @contacts = Contact.all.order("id desc").limit 10
    @contacts = @contacts.where(starred: true) if params[:starred]
    @contacts = @contacts.where("birthdate IS NOT NULL").reorder("month(birthdate), day(birthdate)") if params[:birthdate]
  end

  def show
    #@contact.update(last_read: DateTime.now)

    #respond_to do |format|
    #  format.html
    #  format.json { render json: @contact.to_json } # else only id, created_at, updated_at
    #end
  end

  def new
    @contact = Contact.new
  end

  def edit
  end

  def create
    @contact = Contact.new(contact_params)

    respond_to do |format|
      if @contact.save
        format.html { redirect_to @contact, notice: "Contact was successfully created." }
        # Turbo-stream actions in separate file update.turbo_stream.erb
        #format.turbo_stream { flash.now[:notice] = "Turbo contact was successfully created." }
        #format.json { render :show, status: :created, location: @contact } and return
      else
        format.html { render :new, status: :unprocessable_entity }
        #format.json { render json: @contact.errors, status: :unprocessable_entity }
      end

    # Create a copy for versions management.
    add_version(@contact)

    end
  end

  def update
    if params[:redirect] == "edit"
      url = edit_contact_url(@contact)
    else
      url = contact_url(@contact)
    end

    # Create a copy for versions management.
    add_version(@contact)

    respond_to do |format|
      if @contact.update(contact_params)
        format.html { redirect_to url, notice: "Contact was successfully updated." }
        # Turbo-stream actions in this block
        #format.turbo_stream { render turbo_stream: turbo_stream.replace("contact_#{@contact.id}", @contact) }
        format.json { render :show, status: :ok, location: @contact }
      else
        format.html { render :edit, status: :unprocessable_entity }
        #format.json { render json: @contact.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @contact.destroy

    respond_to do |format|
      #format.turbo_stream { flash.now[:notice] = "Turbo contact was successfully deleted." }
      format.html { redirect_to contacts_path, notice: "Contact was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  def search
    if params.dig(:contact_search).present?
      @contacts = Contact.where('name LIKE ?', "%#{params[:contact_search]}%").order(updated_at: :desc)
    else
      @contacts = []
    end
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.update("contacts", partial: "contacts", locals: { contacts: @contacts })
        ]
      end
    end
  end

  private

  def add_version(contact)
    # Create a copy for versions management.
    @contactversion = Contactversion.new(contact_params.except("id","mongo_id", "created_at","updated_at"))
    @contactversion.org_id = contact.id
    @contactversion.user_id = contact.user_id
    @contactversion.save
  end

    # Use callbacks to share common setup or constraints between actions.
    def set_contact
      @contact = Contact.find(params[:id])
    end

    def contact_params
      params.require(:contact).permit(:name, :phones, :emails, :addresses, :companies, :websites,
        :name, :birthdate, :notes, :starred)
    end
end
