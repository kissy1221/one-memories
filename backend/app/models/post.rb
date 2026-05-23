class Post < ApplicationRecord
  MOODS = { 1 => "😔", 2 => "😕", 3 => "😐", 4 => "🙂", 5 => "😊" }.freeze

  validates :content, presence: true, length: { maximum: 500 }
  validates :posted_on, presence: true, uniqueness: true
  validates :mood, inclusion: { in: MOODS.keys }, allow_nil: true
  validate :not_future_date

  before_validation :set_posted_on, on: :create

  scope :ordered, -> { order(posted_on: :desc) }

  private

  def set_posted_on
    self.posted_on ||= Date.current
  end

  def not_future_date
    return unless posted_on
    errors.add(:posted_on, "cannot be in the future") if posted_on > Date.current
  end
end
