class Api::V1::PostsController < ApplicationController
  def index
    posts = Post.ordered
    render json: posts.map { |p| serialize_post(p) }
  end

  def today
    post = Post.find_by(posted_on: Date.current)
    if post
      render json: serialize_post(post)
    else
      render json: nil
    end
  end

  def one_year_ago
    target = Date.current - 1.year
    post = Post.where(posted_on: (target - 3.days)..(target + 3.days))
               .order(Arel.sql("ABS(posted_on - DATE '#{target}')"))
               .first
    render json: post ? serialize_post(post) : nil
  end

  def streak
    render json: { streak: Post.current_streak }
  end

  def create
    if Post.exists?(posted_on: Date.current)
      render json: { error: "今日はすでに投稿済みです" }, status: :unprocessable_entity
      return
    end

    post = Post.new(post_params)
    if post.save
      render json: serialize_post(post), status: :created
    else
      render json: { errors: post.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def post_params
    params.require(:post).permit(:content, :mood)
  end

  def serialize_post(post)
    {
      id: post.id,
      content: post.content,
      mood: post.mood,
      mood_emoji: post.mood ? Post::MOODS[post.mood] : nil,
      posted_on: post.posted_on.iso8601,
      created_at: post.created_at.iso8601
    }
  end
end
