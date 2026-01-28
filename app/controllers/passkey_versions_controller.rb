# frozen_string_literal: true

class PasskeyVersionsController < ApplicationController
  def index
    @passkey_versions = PasskeyVersion.where(org_id: params[:org_id]).where(user_id: current_user.id).order('id desc')
  end

  def show
    @passkey = PasskeyVersion.where(id: params[:id]).where(user_id: current_user.id).take
    redirect_to passkeys_url, alert: 'Version not found.' and return if @passkey.blank?

    @passkey.updated_at = @passkey.created_at
    @passkey_readonly = true
    @passkey_shares = nil
    render 'passkeys/show'
  end

  def restore
    @passkey_version = PasskeyVersion.where(id: params[:version_id]).where(user_id: current_user.id).take
    redirect_to passkeys_url, alert: 'Version not found.' and return if @passkey_version.blank?

    @passkey = Passkey.where(id: @passkey_version.org_id).where(user_id: current_user.id).take
    redirect_to passkeys_url, alert: 'Passkey not found.' and return if @passkey.blank?

    @passkey.update(@passkey_version.attributes.except('org_id', 'id'))
    redirect_to passkey_path(@passkey), notice: 'passkey restored'
  end

  def compare
    @first_id = params[:ids].split(',').first
    @second_id = params[:ids].split(',').second

    first_version = PasskeyVersion.where(id: @first_id).where(user_id: current_user.id).take
    second_version = PasskeyVersion.where(id: @second_id).where(user_id: current_user.id).take

    @first = version_to_hash(first_version)&.pretty_inspect
    @second = version_to_hash(second_version)&.pretty_inspect
  end

  private

  def version_to_hash(version)
    return nil if version.blank?

    {
      title: version.title,
      username: version.username,
      password: version.password,
      url: version.url,
      notes: version.notes,
      tags: version.tags,
      twofa: version.twofa,
      created_at: version.created_at
    }
  end
end
