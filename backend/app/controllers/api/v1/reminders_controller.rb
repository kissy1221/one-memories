class Api::V1::RemindersController < ApplicationController
  include Authenticatable
  skip_before_action :authenticate!, only: :unsubscribe

  def create
    hour = params[:notify_hour].to_i
    reminder = Reminder.find_or_initialize_by(email: current_user.email)
    reminder.assign_attributes(user: current_user, notify_hour: hour)
    if reminder.save
      render json: { message: "リマインダーを登録しました", notify_hour: reminder.notify_hour }, status: :created
    else
      render json: { errors: reminder.errors.full_messages }, status: :unprocessable_content
    end
  end

  def unsubscribe
    reminder = Reminder.find_by(unsubscribe_token: params[:token])
    if reminder
      reminder.destroy
      render json: { message: "リマインダーを解除しました" }
    else
      render json: { error: "無効なトークンです" }, status: :not_found
    end
  end
end
