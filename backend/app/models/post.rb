class Post < ApplicationRecord
  MOODS = { 1 => "😔", 2 => "😕", 3 => "😐", 4 => "🙂", 5 => "😊" }.freeze

  belongs_to :user, optional: true

  validates :content, presence: true, length: { maximum: 500 }
  validates :posted_on, presence: true, uniqueness: { scope: :user_id }
  validates :mood, inclusion: { in: MOODS.keys }, allow_nil: true
  validate :not_future_date

  before_validation :set_posted_on, on: :create

  scope :ordered, -> { order(posted_on: :desc) }

  def self.current_streak
    dates = order(posted_on: :desc).pluck(:posted_on).to_set
    return 0 if dates.empty?

    # 今日投稿済みなら今日から、未投稿なら昨日からカウント開始
    start = if dates.include?(Date.current)
              Date.current
            elsif dates.include?(Date.current - 1.day)
              Date.current - 1.day
            else
              return 0
            end

    streak = 0
    date = start
    while dates.include?(date)
      streak += 1
      date -= 1.day
    end
    streak
  end

  private

  def set_posted_on
    self.posted_on ||= Date.current
  end

  def not_future_date
    return unless posted_on
    errors.add(:posted_on, "cannot be in the future") if posted_on > Date.current
  end
end
