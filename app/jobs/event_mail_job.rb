class EventMailJob < ApplicationJob
  queue_as :default

  def perform
    # Find events happening 1 day from now (within 1 hour window)
    events = Event.where("start >= STRFTIME('%Y-%m-%d %H:%M', 'now', '+1 day') AND start <= STRFTIME('%Y-%m-%d %H:%M', 'now', '+1 day', '+1 hour')")

    events.each do |event|
      user = User.select(:email).find event.user_id
      Time.zone = event.tz
      BaseMailer.with(to: user.email, event: event).event_mail.deliver
    end
  end
end
