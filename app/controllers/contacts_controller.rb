class ContactsController < ApplicationController
  before_action :set_contact, only: %i[ show edit update destroy ]

  def index
    @contacts = Contact.all.order("id desc").limit 10
  end

  def show
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
        format.html { redirect_to contacts_path, notice: "Contact was successfully created." }
        format.turbo_stream { flash.now[:notice] = "Turbo contact was successfully created." }
        format.json { render :show, status: :created, location: @contact }
      else
        format.html { render :new, status: :unprocessable_entity }
        #format.json { render json: @contact.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @contact.update(contact_params)
        format.html { redirect_to contact_url(@contact), notice: "Contact was successfully updated." }
        format.json { render :show, status: :ok, location: @contact }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @contact.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @contact.destroy

    respond_to do |format|
      format.turbo_stream { @contacts = Contact.all.order("id desc").limit(10) }
      format.html { redirect_to contacts_path, notice: "Contact was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  def search
    if params.dig(:name_search).present?
      @contacts = Contact.where('name LIKE ?', "%#{params[:name_search]}%").order(updated: :desc)
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
    # Use callbacks to share common setup or constraints between actions.
    def set_contact
      @contact = Contact.find(params[:id])
    end

    def contact_params
      params.require(:contact).permit(:name, :phones, :emails, :addresses, :companies, :websites,
        :name, :brithdate, :notes, :starred)
    end
end
