require 'rails_helper'

RSpec.describe Post, type: :model do
  describe 'バリデーション' do
    it { is_expected.to validate_presence_of(:content) }
    it { is_expected.to validate_length_of(:content).is_at_most(500) }
    it { is_expected.to validate_uniqueness_of(:posted_on).scoped_to(:user_id) }

    it '正常な投稿は有効' do
      post = build(:post)
      expect(post).to be_valid
    end

    it '未来の日付は無効' do
      post = build(:post, posted_on: Date.tomorrow)
      expect(post).not_to be_valid
      expect(post.errors[:posted_on]).to be_present
    end

    it '500文字を超えるcontentは無効' do
      post = build(:post, content: 'a' * 501)
      expect(post).not_to be_valid
    end

    it '同じ日付の投稿は2件目が無効' do
      user = create(:user)
      create(:post, posted_on: Date.current, user: user)
      duplicate = build(:post, posted_on: Date.current, user: user)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:posted_on]).to be_present
    end
  end

  describe 'コールバック' do
    it 'posted_on が未設定なら今日の日付を自動セット' do
      post = create(:post, posted_on: nil)
      expect(post.posted_on).to eq Date.current
    end
  end

  describe 'moodバリデーション' do
    it '1〜5の値は有効' do
      (1..5).each do |m|
        expect(build(:post, mood: m)).to be_valid
      end
    end

    it '0や6は無効' do
      expect(build(:post, mood: 0)).not_to be_valid
      expect(build(:post, mood: 6)).not_to be_valid
    end

    it 'nilは有効（任意項目）' do
      expect(build(:post, mood: nil)).to be_valid
    end
  end

  describe 'スコープ' do
    it '.ordered は posted_on の降順で返す' do
      old  = create(:post, posted_on: Date.current - 2)
      mid  = create(:post, posted_on: Date.current - 1)
      new_ = create(:post, posted_on: Date.current)
      expect(Post.ordered).to eq [new_, mid, old]
    end
  end

  describe '.current_streak' do
    it '投稿がなければ0を返す' do
      expect(Post.current_streak).to eq 0
    end

    it '今日だけ投稿していれば1を返す' do
      create(:post, posted_on: Date.current)
      expect(Post.current_streak).to eq 1
    end

    it '今日と昨日投稿していれば2を返す' do
      create(:post, posted_on: Date.current)
      create(:post, posted_on: Date.current - 1)
      expect(Post.current_streak).to eq 2
    end

    it '3日連続で投稿していれば3を返す' do
      create(:post, posted_on: Date.current)
      create(:post, posted_on: Date.current - 1)
      create(:post, posted_on: Date.current - 2)
      expect(Post.current_streak).to eq 3
    end

    it '途中に空白日があればそこで打ち切られる' do
      create(:post, posted_on: Date.current)
      create(:post, posted_on: Date.current - 1)
      # Date.current - 2 は空白
      create(:post, posted_on: Date.current - 3)
      expect(Post.current_streak).to eq 2
    end

    it '今日未投稿でも昨日から連続していればカウントする' do
      create(:post, posted_on: Date.current - 1)
      create(:post, posted_on: Date.current - 2)
      expect(Post.current_streak).to eq 2
    end

    it '今日も昨日も未投稿なら0を返す' do
      create(:post, posted_on: Date.current - 2)
      expect(Post.current_streak).to eq 0
    end
  end
end
