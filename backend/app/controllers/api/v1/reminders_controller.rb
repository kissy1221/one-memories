class Api::V1::RemindersController < ApplicationController
  include Authenticatable
  skip_before_action :authenticate!, only: :unsubscribe

  def index
    reminder = Reminder.find_by(email: current_user.email)
    if reminder
      render json: { notify_hour: reminder.notify_hour, active: reminder.active }
    else
      render json: nil
    end
  end

  def create
    hour = params[:notify_hour].to_i
    reminder = Reminder.find_or_initialize_by(email: current_user.email)
    reminder.assign_attributes(user: current_user, notify_hour: hour, active: true)
    if reminder.save
      render json: { message: "リマインダーを登録しました", notify_hour: reminder.notify_hour, active: reminder.active }, status: :created
    else
      render json: { errors: reminder.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    reminder = Reminder.find_by(email: current_user.email)
    return render json: { error: "リマインダーが設定されていません" }, status: :not_found unless reminder

    attrs = {}
    attrs[:active] = params[:active] if params.key?(:active)
    attrs[:notify_hour] = params[:notify_hour].to_i if params.key?(:notify_hour)

    if reminder.update(attrs)
      render json: { notify_hour: reminder.notify_hour, active: reminder.active }
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
