class PasskeyVersionsController < ApplicationController

  def index
    @passkey_versions = PasskeyVersion.where(org_id: params[:org_id]).order("id desc")
  end

  def show
    @passkey = PasskeyVersion.find(params[:id])
    @passkey.updated_at = @passkey.created_at
    @passkey_shares = PasskeyShare.where(id: @passkey.org_id).where(user_id: current_user.id)
    render "passkeys/show"
  end

  def restore
    @passkey_version = PasskeyVersion.find(params[:version_id])
    @passkey = Passkey.find(@passkey_version.org_id)
    @passkey.id = @passkey_version.org_id
    @passkey.update(@passkey_version.attributes.except("org_id","id"))
    redirect_to passkey_path(@passkey), notice: "passkey restored"
  end

  def compare
    @first_id = params[:ids].split(',').first
    @second_id = params[:ids].split(',').second

    @first = PasskeyVersion.find(@first_id).pretty_inspect
    @second = PasskeyVersion.find(@second_id).pretty_inspect
  end

end
