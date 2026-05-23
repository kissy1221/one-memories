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

  describe 'DELETE /api/v1/reminders/:id' do
    it 'リマインダーを削除して200を返す' do
      reminder = create(:reminder)

      delete "/api/v1/reminders/#{reminder.id}"

      expect(response).to have_http_status(:ok)
      expect(Reminder.exists?(reminder.id)).to be false
    end

    it '存在しないIDは404を返す' do
      delete '/api/v1/reminders/9999'

      expect(response).to have_http_status(:not_found)
    end
  end
end
