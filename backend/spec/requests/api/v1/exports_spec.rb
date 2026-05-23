require "rails_helper"

RSpec.describe "Api::V1::Exports", type: :request do
  let!(:post1) { create(:post, posted_on: "2026-05-20", content: "晴れの日") }
  let!(:post2) { create(:post, posted_on: "2026-05-21", content: "雨の日") }

  describe "GET /api/v1/export" do
    context "type=markdown" do
      it "Markdownファイルをダウンロードできる" do
        get "/api/v1/export", params: { type: "markdown" }
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
        get "/api/v1/export", params: { type: "csv" }
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("text/csv")
        expect(response.body).to include("posted_on,content")
        expect(response.body).to include("2026-05-21,雨の日")
        expect(response.body).to include("2026-05-20,晴れの日")
      end
    end

    context "typeパラメータなし" do
      it "デフォルトでMarkdownを返す" do
        get "/api/v1/export"
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("text/markdown")
      end
    end

    context "投稿がない場合" do
      before { Post.delete_all }

      it "空のMarkdownを返す" do
        get "/api/v1/export", params: { type: "markdown" }
        expect(response).to have_http_status(:ok)
        expect(response.body).to include("# one memory")
      end
    end
  end
end
