class PasskeyversionsController < ApplicationController

  def index
    @passkeyversions = Passkeyversion.where(org_id: params[:org_id]).order("id desc")
  end

  def show

    @passkey = Passkeyversion.find(params[:id])
    @passkey.updated_at = @passkey.created_at

    render "passkeys/show"
  end

  def restore
    @passkeyversion = Passkeyversion.find(params[:version_id])
    @passkey = Passkey.find(@passkeyversion.org_id)
    @passkey.id = @passkeyversion.org_id
    @passkey.update(@passkeyversion.attributes.except("org_id","id"))
    redirect_to passkey_path(@passkey), notice: "passkey restored"
  end

  def compare
    @first_id = params[:ids].split(',').first
    @second_id = params[:ids].split(',').second

    @first = Passkeyversion.find(@first_id).pretty_inspect
    @second = Passkeyversion.find(@second_id).pretty_inspect
  end

end
