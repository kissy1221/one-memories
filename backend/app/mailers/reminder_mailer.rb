class ReminderMailer < ApplicationMailer
  def daily(reminder)
    @app_url = ENV.fetch("APP_URL", "http://localhost:5174")
    @unsubscribe_url = "#{ENV.fetch('API_URL', 'http://localhost:3001')}/api/v1/reminders/#{reminder.id}"
    mail to: reminder.email, subject: "📝 今日のひとことを書きましょう"
  end
end
