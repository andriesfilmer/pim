class PasskeysController < ApplicationController

  before_action :set_passkey, only: %i[ edit update ]

  def index
    @passkeys = Passkey.left_joins(:passkey_shares)
      .where("(passkeys.user_id = #{current_user.id}) OR (passkey_shares.linked_user_id = #{current_user.id})")
      .order(last_read: :desc).limit(500)
  end

  def show
    @passkey = Passkey.left_joins(:passkey_shares).select('passkeys.*,passkey_shares.user_id AS shared_by_user_id')
     .where("(passkeys.user_id = #{current_user.id} AND passkeys.id = ?) OR (passkey_shares.passkey_id = ? AND passkey_shares.linked_user_id = #{current_user.id})",
     params[:id], params[:id]).take

    redirect_to passkeys_url, alert: "Key not found." and return if @passkey.blank?

    # Don't show edit, update and share items in show if it's a shared key
    @passkey.user_id == current_user.id ? @passkey_readonly = false : @passkey_readonly = true

    @passkey.update_column(:last_read,DateTime.now)

    # Needed for form @passkey_share to add new shares.
    @passkey_share = PasskeyShare.new(passkey_id: @passkey.id) if @passkey.id

    unless @passkey_readonly
      @passkey_shares = PasskeyShare.where(passkey_id: @passkey.id).where(user_id: current_user.id)
    end
  end

  def new
    @passkey = Passkey.new
    @passkey_share = PasskeyShare.new
    @passkey_shares = PasskeyShare.where(passkey_id: @passkey.id).where(user_id: current_user.id)
  end

  def edit
    @passkey_share = PasskeyShare.new(passkey_id: @passkey.id)
    @passkey_shares = PasskeyShare.where(passkey_id: @passkey.id).where(user_id: current_user.id)
  end

  def create
    @passkey = Passkey.new(passkey_params)
    @passkey.user_id = current_user.id

    respond_to do |format|
      if @passkey.save
        format.html { redirect_to passkey_url(@passkey), notice: "Key was successfully created." }
      else
        format.turbo_stream {
           render turbo_stream: turbo_stream.replace("passkeyForm", partial: "passkeys/form", locals: { resource: @passkey })
        }
      end
    end

    # Create a copy for versions management.
    add_version(@passkey)

  end

  def update
    respond_to do |format|
      if @passkey.update(passkey_params)
        format.html { redirect_to passkey_url(@passkey), notice: "Key was successfully updated." }
      else
        format.turbo_stream {
           render turbo_stream: turbo_stream.update("passkeyForm", partial: "passkeys/form", locals: { resource: @passkey })
        }
      end
    end

    # Create a copy for versions management.
    add_version(@passkey)

  end

  def destroy
    if params[:shared_by_user_id].present?
      passkey = PasskeyShare.where(passkey_id: params[:id]).where(linked_user_id: current_user.id).take
    else
      passkey = Passkey.where(id: params[:id]).where(user_id: current_user.id).take
    end

    respond_to do |format|
      if passkey
        passkey.destroy
        format.html { redirect_to passkeys_path, notice: "Key was successfully destroyed." }
      else
        format.html { redirect_to passkeys_path, alert: "Key not found." }
      end
    end
  end

  def search
    if params.dig(:search).length > 2
      search = "%#{params[:search]}%"
      @passkeys = Passkey.left_joins(:passkey_shares).where(
         "(passkeys.user_id = #{current_user.id} AND (title LIKE ? OR url LIKE ? OR tags LIKE ?))
       OR
         (passkey_shares.linked_user_id = #{current_user.id} AND (title LIKE ? OR url LIKE ? OR tags LIKE ?))",
         search, search, search, search, search, search).order("updated_at desc")
      cookies[:search] = params[:search]
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
    @passkey_version = PasskeyVersion.new(passkey_params.except("id","created_at","updated_at","picture"))
    @passkey_version.org_id = passkey.id
    @passkey_version.user_id = passkey.user_id
    @passkey_version.save
  end

  def set_passkey
    @passkey = Passkey.where(user_id: current_user.id).where(id: params[:id]).take
    redirect_to passkeys_url, alert: "Key not found." and return if @passkey.blank?
  end

  def passkey_params
    params.require(:passkey).permit(:title, :username, :password, :twofa, :url, :notes, :tags)
  end

end
