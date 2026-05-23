require "rails_helper"

RSpec.describe "Api::V1::Exports", type: :request do
  let(:user) { create(:user) }
  let(:token) { JWT.encode({ user_id: user.id, exp: 1.day.from_now.to_i }, Rails.application.secret_key_base, "HS256") }
  let(:auth_headers) { { "Authorization" => "Bearer #{token}" } }

  let!(:post1) { create(:post, posted_on: "2026-05-20", content: "晴れの日", user: user) }
  let!(:post2) { create(:post, posted_on: "2026-05-21", content: "雨の日", user: user) }

  describe "GET /api/v1/export" do
    context "type=markdown" do
      it "Markdownファイルをダウンロードできる" do
        get "/api/v1/export", params: { type: "markdown" }, headers: auth_headers
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("text/markdown")
        expect(response.body).to include("# one memory")
        expect(response.body).to include("2026-05-21")
        expect(response.body).to include("雨の日")
        expect(response.body).to include("2026-05-20")
        expect(response.body).to include("晴れの日")
      end
    end

    context "type=csv" do
      it "CSVファイルをダウンロードできる" do
        get "/api/v1/export", params: { type: "csv" }, headers: auth_headers
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("text/csv")
        expect(response.body).to include("posted_on,content")
        expect(response.body).to include("2026-05-21,雨の日")
        expect(response.body).to include("2026-05-20,晴れの日")
      end
    end

    context "typeパラメータなし" do
      it "デフォルトでMarkdownを返す" do
        get "/api/v1/export", headers: auth_headers
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("text/markdown")
      end
    end

    context "投稿がない場合" do
      before { Post.delete_all }

      it "空のMarkdownを返す" do
        get "/api/v1/export", params: { type: "markdown" }, headers: auth_headers
        expect(response).to have_http_status(:ok)
        expect(response.body).to include("# one memory")
      end
    end

    context "認証なし" do
      it "401を返す" do
        get "/api/v1/export"
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "他ユーザーの投稿は含まれない" do
      it "自分の投稿のみエクスポートされる" do
        other_user = create(:user)
        create(:post, posted_on: "2026-05-22", content: "他人の投稿", user: other_user)

        get "/api/v1/export", params: { type: "markdown" }, headers: auth_headers

        expect(response.body).not_to include("他人の投稿")
        expect(response.body).to include("晴れの日")
      end
    end
  end
end
