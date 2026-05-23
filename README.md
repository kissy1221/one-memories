# one memory

1日1回だけつぶやける、シンプルな日記Webアプリ。

## スタック

| レイヤー | 技術 |
|---|---|
| バックエンド | Ruby on Rails 8.1 (API mode) |
| フロントエンド | React 19 + Vite + Tailwind CSS |
| データベース | PostgreSQL 16 |
| インフラ | Docker / Docker Compose |

## 起動方法

```bash
# コンテナをビルドして起動
docker compose up -d

# DBのマイグレーション（初回のみ）
docker compose run --rm backend rails db:migrate
```

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:5174 |
| バックエンドAPI | http://localhost:3001 |

## 機能

- 1日1回だけ投稿できる（2回目以降はAPIで拒否）
- 今日の投稿がある場合は読み取り専用で表示
- 過去の投稿を新しい順に一覧表示

## API

```
GET  /api/v1/posts         # 全投稿一覧（新しい順）
GET  /api/v1/posts/today   # 今日の投稿（なければ null）
POST /api/v1/posts         # 新規投稿（body: { post: { content: "..." } }）
```

## 開発コマンド

```bash
# ログを確認
docker compose logs -f

# コンテナを停止
docker compose down

# DBを含めてリセット
docker compose down -v
docker compose up -d
docker compose run --rm backend rails db:migrate

# Railsコンソール
docker compose run --rm backend rails console

# マイグレーション追加
docker compose run --rm backend rails generate migration AddXxxToPosts xxx:string
docker compose run --rm backend rails db:migrate
```

## プロジェクト構成

```
one-memory/
├── docker-compose.yml
├── backend/                          # Rails API
│   ├── Dockerfile
│   ├── app/
│   │   ├── controllers/api/v1/
│   │   │   └── posts_controller.rb
│   │   └── models/
│   │       └── post.rb
│   ├── config/
│   │   ├── initializers/cors.rb
│   │   └── routes.rb
│   └── db/migrate/
└── frontend/                         # React + Vite + Tailwind
    ├── Dockerfile
    └── src/
        ├── App.jsx
        ├── api.js
        └── index.css
```
