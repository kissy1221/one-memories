module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate!
  end

  private

  def authenticate!
    token = request.headers["Authorization"]&.delete_prefix("Bearer ")
    payload = JWT.decode(token, jwt_secret, true, algorithm: "HS256").first
    @current_user = User.find(payload["user_id"])
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound
    render json: { error: "認証が必要です" }, status: :unauthorized
  end

  def current_user
    @current_user
  end

  def jwt_secret
    Rails.application.secret_key_base
  end
end
