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

  it '作成時にunsubscribe_tokenが自動生成される' do
    reminder = create(:reminder)
    expect(reminder.unsubscribe_token).to be_present
  end

  it 'unsubscribe_tokenは各レコードで一意' do
    r1 = create(:reminder, email: 'a@example.com')
    r2 = create(:reminder, email: 'b@example.com')
    expect(r1.unsubscribe_token).not_to eq r2.unsubscribe_token
  end
end
