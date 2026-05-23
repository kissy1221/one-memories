class Api::V1::RemindersController < ApplicationController
  def create
    reminder = Reminder.find_or_initialize_by(email: params[:email])
    if reminder.save
      render json: { message: "リマインダーを登録しました", email: reminder.email }, status: :created
    else
      render json: { errors: reminder.errors.full_messages }, status: :unprocessable_entity
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
