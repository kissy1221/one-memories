require 'rails_helper'

RSpec.describe 'Api::V1::Users', type: :request do
  let(:user) { create(:user, email: 'user@example.com', password: 'password123') }
  let(:token) { JWT.encode({ user_id: user.id, exp: 1.day.from_now.to_i }, Rails.application.secret_key_base, 'HS256') }
  let(:auth_headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/users/me' do
    context '認証済みの場合' do
      it 'メールアドレスを返す' do
        get '/api/v1/users/me', headers: auth_headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['email']).to eq 'user@example.com'
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        get '/api/v1/users/me'

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH /api/v1/users/me' do
    context 'メールアドレス変更' do
      it '正しい現在のパスワードでメールアドレスを更新できる' do
        patch '/api/v1/users/me',
              params: { current_password: 'password123', email: 'new@example.com' },
              headers: auth_headers,
              as: :json

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['email']).to eq 'new@example.com'
        expect(json['token']).to be_present
        expect(user.reload.email).to eq 'new@example.com'
      end

      it '不正なメールアドレスは422を返す' do
        patch '/api/v1/users/me',
              params: { current_password: 'password123', email: 'invalid' },
              headers: auth_headers,
              as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_present
      end
    end

    context 'パスワード変更' do
      it '正しい現在のパスワードでパスワードを更新できる' do
        patch '/api/v1/users/me',
              params: { current_password: 'password123', password: 'newpassword456', password_confirmation: 'newpassword456' },
              headers: auth_headers,
              as: :json

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['token']).to be_present
        expect(user.reload.authenticate('newpassword456')).to be_truthy
      end

      it 'パスワード確認が不一致の場合は422を返す' do
        patch '/api/v1/users/me',
              params: { current_password: 'password123', password: 'newpassword456', password_confirmation: 'mismatch' },
              headers: auth_headers,
              as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context '現在のパスワードが間違っている場合' do
      it '422を返す' do
        patch '/api/v1/users/me',
              params: { current_password: 'wrongpassword', email: 'new@example.com' },
              headers: auth_headers,
              as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to eq '現在のパスワードが正しくありません'
      end
    end

    context '未認証の場合' do
      it '401を返す' do
        patch '/api/v1/users/me',
              params: { current_password: 'password123', email: 'new@example.com' },
              as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
