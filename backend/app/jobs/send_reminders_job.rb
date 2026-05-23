class SendRemindersJob < ApplicationJob
  queue_as :default

  def perform
    return if Post.exists?(posted_on: Date.current)
    Reminder.find_each do |reminder|
      ReminderMailer.daily(reminder).deliver_now
    end
  end
end
