class PasskeySharesController < ApplicationController

  def index
    @passkey_shares = PasskeyShare.includes(:passkey).where(user_id: current_user.id).order(:passkey_id)
  end

  def create

    @passkey_share = PasskeyShare.new(passkey_share_params)
    @passkey_share.user_id = current_user.id
    @passkey_shares = PasskeyShare.where(passkey_id: params[:passkey_share][:passkey_id]).where(user_id: current_user.id)

    # Check linked_user_id in db from email
    linked_user = User.where(email: params[:passkey_share][:email]).take
    @passkey_share.linked_user_id = linked_user.try(:id)

    # We use the (small) dialog form and don't write standard show_errors partial
    # We show only the first error if exists.
    if !@passkey_share.valid?
      flash.now[:alert] = @passkey_share.errors.to_a.first
    else
      flash.now[:success] = "#{linked_user.name} can now read this keypass"
    end

    respond_to do |format|
      if @passkey_share.save
        format.html { redirect_to edit_passkey_url(params[:passkey_share][:passkey_id]) }
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.update("dialog_flash", partial: "layouts/dialog_flash"),
            turbo_stream.update("passkey_shares", partial: "/passkeys/passkey_shares", locals: { resource: @passkey_share }),
            turbo_stream.update("passkey_sharesForm", partial: "/passkeys/passkey_shares", locals: { resource: @passkey_share })
          ]
        end
      else
        format.turbo_stream do
          render turbo_stream: [
            # First turbo stream is not present in html, but viewable in Devtools -> network -> preview.
            turbo_stream.update("show_errors", partial: "layouts/show_errors", locals: {resource: @passkey_share} ),
            turbo_stream.update("dialog_flash", partial: "layouts/dialog_flash"),
          ]
        end
      end
    end
  end

  def destroy
    @passkey_shares = PasskeyShare.where(passkey_id: params[:passkey_id]).where(user_id: current_user.id)
    @passkey_share = PasskeyShare.where(id: params[:id]).where(user_id: current_user).take
    @passkey_share.destroy

    respond_to do |format|
      format.turbo_stream do
        flash.now[:success] = "Remove share successfully"
        render turbo_stream: [
          turbo_stream.update("dialog_flash", partial: "layouts/dialog_flash"),
          turbo_stream.update("passkey_shares", partial: "/passkeys/passkey_shares", locals: { resource: @passkey_share }),
          turbo_stream.update("passkey_sharesForm", partial: "/passkeys/passkey_shares", locals: { resource: @passkey_share })
        ]
      end
    end
  end

  private

  def passkey_share_params
    params.require(:passkey_share).permit(:passkey_id, :email, :linked_user_id)
  end

end
