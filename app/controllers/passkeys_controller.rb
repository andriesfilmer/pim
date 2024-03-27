class PasskeysController < ApplicationController

  before_action :set_passkey, only: %i[ show edit update destroy ]

  def index
    @passkeys = Passkey.where(user_id: current_user.id).order("last_read desc").limit 10
  end

  def show
    @passkey.update_column(:last_read,DateTime.now)
  end

  def new
    @passkey = Passkey.new
  end

  def edit
  end

  def create
    @passkey = Passkey.new(passkey_params)
    @passkey.user_id = current_user.id

    respond_to do |format|
      if @passkey.save
        format.html { redirect_to passkey_url(@passkey), notice: "Key was successfully created." }
        format.json { render :show, status: :created, location: @passkey }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @passkey.errors, status: :unprocessable_entity }
      end
    end

    # Create a copy for versions management.
    add_version(@passkey)

  end

  def update
    respond_to do |format|
      if @passkey.update(passkey_params)
        format.html { redirect_to passkey_url(@passkey), notice: "Key was successfully updated." }
        format.json { render :show, status: :ok, location: @passkey }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @passkey.errors, status: :unprocessable_entity }
      end
    end

    # Create a copy for versions management.
    add_version(@passkey)

  end

  def destroy
    @passkey.destroy
    respond_to do |format|
      format.html { redirect_to passkeys_url, notice: "Key was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  def search
    if params.dig(:passkey_search).present?
      search = "%#{params[:passkey_search]}%"
      @passkeys = Passkey.where("title LIKE ? OR url LIKE ? OR tags LIKE ?", search, search, search)
                   .order(updated_at: :desc)
    else
      @passkeys = []
    end
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.update("passkeys", partial: "passkeys", locals: { passkeys: @passkeys })
        ]
      end
    end
  end

  private

  def add_version(passkey)
    # Create a copy for versions management.
    @passkeyversion = Passkeyversion.new(passkey_params.except("id","created_at","updated_at","picture"))
    @passkeyversion.org_id = passkey.id
    @passkeyversion.user_id = passkey.user_id
    @passkeyversion.save
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_passkey
    @passkey = Passkey.where(user_id: current_user.id).where(id: params[:id]).take
  end

  def passkey_params
    params.require(:passkey).permit(:title, :username, :password, :url, :notes, :tags)
  end

end
