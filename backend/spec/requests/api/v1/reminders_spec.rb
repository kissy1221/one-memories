require 'rails_helper'

RSpec.describe 'Api::V1::Reminders', type: :request do
  let(:user) { create(:user) }
  let(:token) { JWT.encode({ user_id: user.id, exp: 1.day.from_now.to_i }, Rails.application.secret_key_base, 'HS256') }
  let(:auth_headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/reminders' do
    it '認証なしは401を返す' do
      get '/api/v1/reminders', as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it 'リマインダーが未設定の場合nullを返す' do
      get '/api/v1/reminders', as: :json, headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.body).to eq 'null'
    end

    it '設定済みの場合notify_hourとactiveを返す' do
      create(:reminder, email: user.email, user: user, notify_hour: 20, active: true)

      get '/api/v1/reminders', as: :json, headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['notify_hour']).to eq 20
      expect(json['active']).to eq true
    end
  end

  describe 'POST /api/v1/reminders' do
    it '認証なしは401を返す' do
      post '/api/v1/reminders', params: { notify_hour: 21 }, as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it 'notify_hourを指定してリマインダーを登録し201を返す' do
      post '/api/v1/reminders', params: { notify_hour: 21 }, as: :json, headers: auth_headers

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['notify_hour']).to eq 21
      expect(json['active']).to eq true
      expect(Reminder.count).to eq 1
    end

    it '登録時に推測困難なunsubscribe_tokenが生成される' do
      post '/api/v1/reminders', params: { notify_hour: 21 }, as: :json, headers: auth_headers

      token = Reminder.last.unsubscribe_token
      expect(token).to be_present
      expect(token.length).to be >= 32
    end

    it '同じユーザーの重複登録は更新になる（冪等）' do
      post '/api/v1/reminders', params: { notify_hour: 20 }, as: :json, headers: auth_headers
      post '/api/v1/reminders', params: { notify_hour: 22 }, as: :json, headers: auth_headers

      expect(Reminder.count).to eq 1
      expect(Reminder.last.notify_hour).to eq 22
    end

    it '範囲外のnotify_hourは422を返す' do
      post '/api/v1/reminders', params: { notify_hour: 24 }, as: :json, headers: auth_headers

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'PATCH /api/v1/reminders' do
    let!(:reminder) { create(:reminder, email: user.email, user: user, notify_hour: 21, active: true) }

    it '認証なしは401を返す' do
      patch '/api/v1/reminders', params: { active: false }, as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it 'activeをfalseにするとOFFになる' do
      patch '/api/v1/reminders', params: { active: false }, as: :json, headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['active']).to eq false
      expect(reminder.reload.active).to eq false
    end

    it 'activeをtrueにするとONになる' do
      reminder.update!(active: false)

      patch '/api/v1/reminders', params: { active: true }, as: :json, headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['active']).to eq true
    end

    it 'リマインダーが未設定の場合は404を返す' do
      reminder.destroy

      patch '/api/v1/reminders', params: { active: false }, as: :json, headers: auth_headers

      expect(response).to have_http_status(:not_found)
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
