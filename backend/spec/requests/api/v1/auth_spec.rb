require 'rails_helper'

RSpec.describe 'Api::V1::Auth', type: :request do
  describe 'POST /api/v1/auth/signup' do
    context '正常系' do
      it 'ユーザーを作成してトークンを返す' do
        expect {
          post '/api/v1/auth/signup',
               params: { email: 'new@example.com', password: 'password123' },
               as: :json
        }.to change(User, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['token']).to be_present
        expect(json['email']).to eq 'new@example.com'
      end
    end

    context 'メールアドレスが重複している場合' do
      it '422を返す' do
        create(:user, email: 'dup@example.com')

        post '/api/v1/auth/signup',
             params: { email: 'dup@example.com', password: 'password123' },
             as: :json

        expect(response).to have_http_status(:unprocessable_content)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_present
      end
    end

    context 'パスワードが空の場合' do
      it '422を返す' do
        post '/api/v1/auth/signup',
             params: { email: 'new@example.com', password: '' },
             as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context 'メールアドレスが不正な場合' do
      it '422を返す' do
        post '/api/v1/auth/signup',
             params: { email: 'invalid', password: 'password123' },
             as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end

  describe 'POST /api/v1/auth/login' do
    let!(:user) { create(:user, email: 'user@example.com', password: 'password123') }

    context '正常系' do
      it 'トークンを返す' do
        post '/api/v1/auth/login',
             params: { email: 'user@example.com', password: 'password123' },
             as: :json

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['token']).to be_present
        expect(json['email']).to eq 'user@example.com'
      end

      it 'メールアドレスは大文字小文字を区別しない' do
        post '/api/v1/auth/login',
             params: { email: 'USER@EXAMPLE.COM', password: 'password123' },
             as: :json

        expect(response).to have_http_status(:ok)
      end
    end

    context 'パスワードが間違っている場合' do
      it '401を返す' do
        post '/api/v1/auth/login',
             params: { email: 'user@example.com', password: 'wrong' },
             as: :json

        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to be_present
      end
    end

    context '存在しないメールアドレスの場合' do
      it '401を返す' do
        post '/api/v1/auth/login',
             params: { email: 'nobody@example.com', password: 'password123' },
             as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
