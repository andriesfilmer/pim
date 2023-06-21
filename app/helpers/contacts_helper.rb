module ContactsHelper

  def get_birthday_age(contact)
    birthdate = contact.birthdate
    now = Time.zone.now
    age = now.year - birthdate.year
    age -= 1 if now.month < birthdate.month || (now.month == birthdate.month && now.day < birthdate.day)
    return "#{birthdate.strftime('%B %d, %Y')} | #{age}"
  end
end
