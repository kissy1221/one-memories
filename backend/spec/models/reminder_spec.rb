require 'rails_helper'

RSpec.describe Reminder, type: :model do
  it { is_expected.to validate_presence_of(:email) }
  it { is_expected.to validate_uniqueness_of(:email) }

  it '正しいメールアドレスは有効' do
    expect(build(:reminder, email: 'test@example.com')).to be_valid
  end

  it '不正なメールアドレスは無効' do
    expect(build(:reminder, email: 'not-an-email')).not_to be_valid
  end
end
