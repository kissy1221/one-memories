require 'rails_helper'

RSpec.describe User, type: :model do
  it { is_expected.to validate_presence_of(:email) }
  it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
  it { is_expected.to have_secure_password }

  it '正しいメールアドレスは有効' do
    expect(build(:user, email: 'valid@example.com')).to be_valid
  end

  it '不正なメールアドレスは無効' do
    expect(build(:user, email: 'invalid')).not_to be_valid
  end

  it 'メールアドレスは保存時に小文字に変換される' do
    user = create(:user, email: 'TEST@EXAMPLE.COM')
    expect(user.reload.email).to eq 'test@example.com'
  end

  it 'has_many posts' do
    is_expected.to have_many(:posts).dependent(:destroy)
  end
end
