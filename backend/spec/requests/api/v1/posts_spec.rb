require 'rails_helper'

RSpec.describe 'Api::V1::Posts', type: :request do
  describe 'GET /api/v1/posts' do
    it '全投稿をJSON配列で返す' do
      create(:post, posted_on: Date.current - 1, content: '昨日の記録')
      create(:post, posted_on: Date.current - 2, content: '一昨日の記録')

      get '/api/v1/posts'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.length).to eq 2
      expect(json.first['posted_on']).to eq (Date.current - 1).iso8601
    end

    it '投稿がなければ空配列を返す' do
      get '/api/v1/posts'

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq []
    end
  end

  describe 'GET /api/v1/posts/today' do
    context '今日の投稿がある場合' do
      it '今日の投稿をJSONで返す' do
        post = create(:post, posted_on: Date.current, content: '今日のひとこと')

        get '/api/v1/posts/today'

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['id']).to eq post.id
        expect(json['content']).to eq '今日のひとこと'
        expect(json['posted_on']).to eq Date.current.iso8601
      end
    end

    context '今日の投稿がない場合' do
      it 'null を返す' do
        get '/api/v1/posts/today'

        expect(response).to have_http_status(:ok)
        expect(response.body).to eq 'null'
      end
    end
  end

  describe 'POST /api/v1/posts' do
    context '正常系' do
      it '投稿を作成して201を返す' do
        expect {
          post '/api/v1/posts', params: { post: { content: '今日も良い日だった' } }, as: :json
        }.to change(Post, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['content']).to eq '今日も良い日だった'
        expect(json['posted_on']).to eq Date.current.iso8601
      end

      it 'moodを含めた投稿を作成できる' do
        post '/api/v1/posts', params: { post: { content: '良い日だった', mood: 5 } }, as: :json

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['mood']).to eq 5
        expect(json['mood_emoji']).to eq '😊'
      end
    end

    context '今日すでに投稿済みの場合' do
      it 'エラーメッセージと422を返す' do
        create(:post, posted_on: Date.current)

        post '/api/v1/posts', params: { post: { content: '2回目の投稿' } }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        json = JSON.parse(response.body)
        expect(json['error']).to eq '今日はすでに投稿済みです'
      end
    end

    context 'contentが空の場合' do
      it 'バリデーションエラーと422を返す' do
        post '/api/v1/posts', params: { post: { content: '' } }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        json = JSON.parse(response.body)
        expect(json['errors']).to be_present
      end
    end

    context 'contentが500文字を超える場合' do
      it 'バリデーションエラーと422を返す' do
        post '/api/v1/posts', params: { post: { content: 'a' * 501 } }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end
end
