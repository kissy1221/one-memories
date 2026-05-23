class Api::V1::RemindersController < ApplicationController
  def create
    reminder = Reminder.find_or_initialize_by(email: params[:email])
    if reminder.save
      render json: { message: "リマインダーを登録しました", email: reminder.email }, status: :created
    else
      render json: { errors: reminder.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    reminder = Reminder.find_by(id: params[:id])
    if reminder
      reminder.destroy
      render json: { message: "リマインダーを解除しました" }
    else
      render json: { error: "見つかりませんでした" }, status: :not_found
    end
  end
end
