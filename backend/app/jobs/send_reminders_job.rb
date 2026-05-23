class SendRemindersJob < ApplicationJob
  queue_as :default

  def perform
    current_hour = Time.current.hour
    Reminder.where(notify_hour: current_hour).find_each do |reminder|
      next if reminder.user&.posts&.exists?(posted_on: Date.current)
      ReminderMailer.daily(reminder).deliver_now
    end
  end
end
