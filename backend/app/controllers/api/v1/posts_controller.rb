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
    params.require(:post).permit(:content)
  end

  def serialize_post(post)
    {
      id: post.id,
      content: post.content,
      posted_on: post.posted_on.iso8601,
      created_at: post.created_at.iso8601
    }
  end
end
