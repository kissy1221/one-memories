class Reminder < ApplicationRecord
  belongs_to :user, optional: true

  validates :email, presence: true, uniqueness: true,
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :unsubscribe_token, presence: true, uniqueness: true
  validates :notify_hour, inclusion: { in: 0..23 }

  before_validation :generate_unsubscribe_token, on: :create

  private

  def generate_unsubscribe_token
    self.unsubscribe_token = SecureRandom.urlsafe_base64(32)
  end
end
