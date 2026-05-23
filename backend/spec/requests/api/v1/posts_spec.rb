require 'rails_helper'

RSpec.describe 'Api::V1::Posts', type: :request do
  let(:user) { create(:user) }
  let(:token) { JWT.encode({ user_id: user.id, exp: 1.day.from_now.to_i }, Rails.application.secret_key_base, 'HS256') }
  let(:auth_headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/posts' do
    it '全投稿をJSON配列で返す' do
      create(:post, posted_on: Date.current - 1, content: '昨日の記録', user: user)
      create(:post, posted_on: Date.current - 2, content: '一昨日の記録', user: user)

      get '/api/v1/posts', headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq 2
      expect(json.first['posted_on']).to eq (Date.current - 1).iso8601
    end

    it '投稿がなければ空配列を返す' do
      get '/api/v1/posts', headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq []
    end

    it '認証なしは401を返す' do
      get '/api/v1/posts'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /api/v1/posts/today' do
    context '今日の投稿がある場合' do
      it '今日の投稿をJSONで返す' do
        post = create(:post, posted_on: Date.current, content: '今日のひとこと', user: user)

        get '/api/v1/posts/today', headers: auth_headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['id']).to eq post.id
        expect(json['content']).to eq '今日のひとこと'
        expect(json['posted_on']).to eq Date.current.iso8601
      end
    end

    context '今日の投稿がない場合' do
      it 'null を返す' do
        get '/api/v1/posts/today', headers: auth_headers

        expect(response).to have_http_status(:ok)
        expect(response.body).to eq 'null'
      end
    end
  end

  describe 'GET /api/v1/posts/one_year_ago' do
    it '1年前ちょうどの投稿を返す' do
      post = create(:post, posted_on: Date.current - 1.year, content: '去年の今日', user: user)

      get '/api/v1/posts/one_year_ago', headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['id']).to eq post.id
      expect(json['content']).to eq '去年の今日'
    end

    it '1年前±3日以内の投稿を返す' do
      post = create(:post, posted_on: Date.current - 1.year + 2.days, content: '2日ずれの去年', user: user)

      get '/api/v1/posts/one_year_ago', headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['id']).to eq post.id
    end

    it '複数ある場合は最近傍の投稿を返す' do
      far  = create(:post, posted_on: Date.current - 1.year - 3.days, content: '3日前', user: user)
      near = create(:post, posted_on: Date.current - 1.year + 1.day,  content: '1日後', user: user)

      get '/api/v1/posts/one_year_ago', headers: auth_headers

      json = JSON.parse(response.body)
      expect(json['id']).to eq near.id
    end

    it '±3日を超える投稿はnullを返す' do
      create(:post, posted_on: Date.current - 1.year - 4.days, content: '範囲外', user: user)

      get '/api/v1/posts/one_year_ago', headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.body).to eq 'null'
    end

    it '1年前の投稿がなければnullを返す' do
      get '/api/v1/posts/one_year_ago', headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.body).to eq 'null'
    end
  end

  describe 'GET /api/v1/posts/streak' do
    it '連続投稿日数を返す' do
      create(:post, posted_on: Date.current, user: user)
      create(:post, posted_on: Date.current - 1, user: user)

      get '/api/v1/posts/streak', headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['streak']).to eq 2
    end

    it '投稿がなければ0を返す' do
      get '/api/v1/posts/streak', headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['streak']).to eq 0
    end
  end

  describe 'POST /api/v1/posts' do
    context '正常系' do
      it '投稿を作成して201を返す' do
        expect {
          post '/api/v1/posts', params: { post: { content: '今日も良い日だった' } }, as: :json, headers: auth_headers
        }.to change(Post, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['content']).to eq '今日も良い日だった'
        expect(json['posted_on']).to eq Date.current.iso8601
      end

      it 'moodを含めた投稿を作成できる' do
        post '/api/v1/posts', params: { post: { content: '良い日だった', mood: 5 } }, as: :json, headers: auth_headers

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['mood']).to eq 5
        expect(json['mood_emoji']).to eq '😊'
      end
    end

    context '今日すでに投稿済みの場合' do
      it 'エラーメッセージと422を返す' do
        create(:post, posted_on: Date.current, user: user)

        post '/api/v1/posts', params: { post: { content: '2回目の投稿' } }, as: :json, headers: auth_headers

        expect(response).to have_http_status(:unprocessable_content)
        json = JSON.parse(response.body)
        expect(json['error']).to eq '今日はすでに投稿済みです'
      end
    end

    context 'contentが空の場合' do
      it 'バリデーションエラーと422を返す' do
        post '/api/v1/posts', params: { post: { content: '' } }, as: :json, headers: auth_headers

        expect(response).to have_http_status(:unprocessable_content)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_present
      end
    end

    context 'contentが500文字を超える場合' do
      it 'バリデーションエラーと422を返す' do
        post '/api/v1/posts', params: { post: { content: 'a' * 501 } }, as: :json, headers: auth_headers

        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end
end
