class PasskeysharesController < ApplicationController

  def index
    @passkeyshares = Passkeyshare.includes(:passkey).where(user_id: current_user.id).order(:passkey_id)
  end

  def create

    @passkeyshare = Passkeyshare.new(passkeyshare_params)
    @passkeyshare.user_id = current_user.id
    @passkeyshares = Passkeyshare.where(passkey_id: params[:passkeyshare][:passkey_id]).where(user_id: current_user.id)

    linked_user = User.where(email: params[:passkeyshare][:email]).take
    linked_user_exits = Passkeyshare.where(passkey_id: params[:passkeyshare][:passkey_id])
                                    .where(linked_user_id: linked_user.try(:id))
                                    .where(user_id: current_user.id).take
    if linked_user_exits
      flash.now[:alert] = "#{linked_user.name} already has this keypass share!"
    elsif linked_user
      flash.now[:success] = "#{linked_user.name} can now read this keypass"
      @passkeyshare.linked_user_id = linked_user.id
    else
      flash.now[:alert] = "User with email #{params[:passkeyshare][:email]} does not exists"
    end

    respond_to do |format|
      if @passkeyshare.save
        format.html { redirect_to edit_passkey_url(params[:passkeyshare][:passkey_id]) }
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.update("dialog_flash", partial: "layouts/dialog_flash"),
            turbo_stream.update("passkeyshares", partial: "/passkeys/passkeyshares", locals: { resource: @passkeyshare }),
            turbo_stream.update("passkeysharesForm", partial: "/passkeys/passkeyshares", locals: { resource: @passkeyshare })
          ]
        end
      else
        format.turbo_stream do
          render turbo_stream: [
            # Show errors turbo stream is not present in html, but viewable in Devtools -> network -> preview.
            turbo_stream.update("show_errors", partial: "layouts/show_errors", locals: {resource: @passkeyshare} ),
            turbo_stream.update("dialog_flash", partial: "layouts/dialog_flash"),
            turbo_stream.update("passkeyshares", partial: "/passkeys/passkeyshares", locals: { resource: @passkeyshare }),
            turbo_stream.update("passkeysharesForm", partial: "/passkeys/passkeyshares", locals: { resource: @passkeyshare })
          ]
        end
      end
    end
  end

  def destroy
    @passkeyshares = Passkeyshare.where(passkey_id: params[:passkey_id]).where(user_id: current_user.id)
    @passkeyshare = Passkeyshare.where(id: params[:id]).where(user_id: current_user).take
    @passkeyshare.destroy

    respond_to do |format|
      format.turbo_stream do
        flash.now[:success] = "Remove share successfully"
        render turbo_stream: [
          turbo_stream.update("dialog_flash", partial: "layouts/dialog_flash"),
          turbo_stream.update("passkeyshares", partial: "/passkeys/passkeyshares", locals: { resource: @passkeyshare }),
          turbo_stream.update("passkeysharesForm", partial: "/passkeys/passkeyshares", locals: { resource: @passkeyshare })
        ]
      end
    end
  end

  private

  def passkeyshare_params
    params.require(:passkeyshare).permit(:passkey_id, :email, :linked_user_id)
  end


end
