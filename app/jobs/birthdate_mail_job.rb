class BirthdateMailJob < ApplicationJob
  queue_as :default

  def perform
    # Find contacts with birthdays tomorrow
    contacts = Contact.where("STRFTIME('%m-%d', birthdate) = STRFTIME('%m-%d', 'now', '+1 day')")

    contacts.each do |contact|
      user = User.select(:email).find contact.user_id
      BaseMailer.with(to: user.email, contact: contact).birthdate_mail.deliver
    end
  end
end
