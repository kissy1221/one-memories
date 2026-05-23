require 'rails_helper'

RSpec.describe 'Api::V1::Reminders', type: :request do
  describe 'POST /api/v1/reminders' do
    it 'メールアドレスを登録して201を返す' do
      post '/api/v1/reminders', params: { email: 'test@example.com' }, as: :json

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['email']).to eq 'test@example.com'
      expect(Reminder.count).to eq 1
    end

    it '登録時に推測困難なunsubscribe_tokenが生成される' do
      post '/api/v1/reminders', params: { email: 'test@example.com' }, as: :json

      token = Reminder.last.unsubscribe_token
      expect(token).to be_present
      expect(token.length).to be >= 32
    end

    it '同じメールアドレスは重複登録にならない（冪等）' do
      create(:reminder, email: 'test@example.com')

      post '/api/v1/reminders', params: { email: 'test@example.com' }, as: :json

      expect(Reminder.count).to eq 1
    end

    it '不正なメールアドレスは422を返す' do
      post '/api/v1/reminders', params: { email: 'invalid' }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'GET /api/v1/reminders/unsubscribe' do
    it '有効なトークンでリマインダーを解除して200を返す' do
      reminder = create(:reminder)

      get "/api/v1/reminders/unsubscribe", params: { token: reminder.unsubscribe_token }

      expect(response).to have_http_status(:ok)
      expect(Reminder.exists?(reminder.id)).to be false
    end

    it '無効なトークンは404を返す' do
      get '/api/v1/reminders/unsubscribe', params: { token: 'invalid_token' }

      expect(response).to have_http_status(:not_found)
    end

    it 'IDを直接指定しても解除できない（IDによる推測攻撃が効かない）' do
      reminder = create(:reminder)

      get "/api/v1/reminders/unsubscribe", params: { token: reminder.id.to_s }

      expect(response).to have_http_status(:not_found)
      expect(Reminder.exists?(reminder.id)).to be true
    end
  end
end
