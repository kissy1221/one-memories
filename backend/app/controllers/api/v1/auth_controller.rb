class Api::V1::AuthController < ApplicationController
  def signup
    user = User.new(email: params[:email], password: params[:password])
    if user.save
      render json: { token: generate_token(user), email: user.email }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by(email: params[:email]&.downcase)
    if user&.authenticate(params[:password])
      render json: { token: generate_token(user), email: user.email }
    else
      render json: { error: "メールアドレスまたはパスワードが正しくありません" }, status: :unauthorized
    end
  end

  private

  def generate_token(user)
    payload = { user_id: user.id, exp: 30.days.from_now.to_i }
    JWT.encode(payload, Rails.application.secret_key_base, "HS256")
  end
end
