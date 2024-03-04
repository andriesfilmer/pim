class Event < ApplicationRecord

  alias_attribute :start_date, :start
  alias_attribute :start_time, :start
  alias_attribute :end_date, :end
  alias_attribute :end_time, :end

  validates :title, presence: true
  validates :start, presence: true
  validates :end, presence: true

  #after_find :get_offset_time
  #before_save :set_offset_time

  private

  def self.set_start(start_date,start_time)
    "#{start_date} #{start_time}"
  end

  def self.set_end(end_date,end_time)
    "#{end_date} #{end_time}"
  end

  def get_offset_time
    self.start = self.start.to_datetime.in_time_zone(self.tz).to_s[0,16]
    self.end = self.end.to_datetime.in_time_zone(self.tz).to_s[0,16]
  end

  def set_offset_time
    self.start = self.start.to_datetime.in_time_zone(self.tz).to_s[0,16]
    self.end = self.end.to_datetime.in_time_zone(self.tz).to_s[0,16]
  end
end

