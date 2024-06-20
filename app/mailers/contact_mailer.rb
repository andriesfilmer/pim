class ContactMailer < ApplicationMailer

  def birthdate_mail
    to = params[:to]
    @contact = params[:contact]
    mail(to: to, subject: "Anniversary #{@contact.name} (#{@contact.age(@contact.birthdate)}) tomorrow")
  end

end
