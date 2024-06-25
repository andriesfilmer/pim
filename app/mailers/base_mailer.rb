class BaseMailer < ApplicationMailer

  def birthdate_mail
    to = params[:to]
    @contact = params[:contact]
    mail(to: to, subject: "Anniversary #{@contact.name} (#{@contact.age(@contact.birthdate)}) tomorrow")
  end

  def event_mail
    to = params[:to]
    @event = params[:event]
    mail(to: to, subject: "Event #{@event.title} | #{@event.start.to_s[0,16]}-#{@event.end.to_s[0,16]}")
  end

end
