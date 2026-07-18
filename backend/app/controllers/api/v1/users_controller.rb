class Api::V1::UsersController < ApplicationController
  include Authenticatable

  def show
    render json: { email: current_user.email }
  end

  def update
    unless current_user.authenticate(params[:current_password].to_s)
      render json: { error: "現在のパスワードが正しくありません" }, status: :unprocessable_entity
      return
    end

    update_params = {}
    update_params[:email] = params[:email] if params[:email].present?
    if params[:password].present?
      update_params[:password] = params[:password]
      update_params[:password_confirmation] = params[:password_confirmation]
    end

    if current_user.update(update_params)
      new_token = generate_token(current_user)
      render json: { email: current_user.email, token: new_token }
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def generate_token(user)
    payload = { user_id: user.id, exp: 30.days.from_now.to_i }
    JWT.encode(payload, Rails.application.secret_key_base, "HS256")
  end
end
