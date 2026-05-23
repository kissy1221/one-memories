require 'rails_helper'

RSpec.describe SendRemindersJob, type: :job do
  describe '#perform' do
    let(:current_hour) { Time.current.hour }
    let(:user) { create(:user) }
    let!(:reminder) { create(:reminder, email: user.email, user: user, notify_hour: current_hour) }

    context '今日まだ投稿していない場合' do
      it 'リマインダーメールを送信する' do
        expect { SendRemindersJob.new.perform }
          .to change { ActionMailer::Base.deliveries.count }.by(1)

        mail = ActionMailer::Base.deliveries.last
        expect(mail.to).to include user.email
        expect(mail.subject).to include '今日のひとことを書きましょう'
      end
    end

    context '今日すでに投稿済みの場合' do
      before { create(:post, posted_on: Date.current, user: user) }

      it 'メールを送信しない' do
        expect { SendRemindersJob.new.perform }
          .not_to change { ActionMailer::Base.deliveries.count }
      end
    end

    context '別の時刻に設定されている場合' do
      let(:other_hour) { (current_hour + 1) % 24 }
      let!(:other_reminder) { create(:reminder, notify_hour: other_hour) }

      it '現在の時刻と一致するリマインダーにのみ送信する' do
        expect { SendRemindersJob.new.perform }
          .to change { ActionMailer::Base.deliveries.count }.by(1)

        mail = ActionMailer::Base.deliveries.last
        expect(mail.to).to include user.email
      end
    end

    context '複数ユーザーがいる場合' do
      let(:user2) { create(:user) }
      let!(:reminder2) { create(:reminder, email: user2.email, user: user2, notify_hour: current_hour) }

      it '投稿済みのユーザーはスキップし未投稿のユーザーには送信する' do
        create(:post, posted_on: Date.current, user: user)

        expect { SendRemindersJob.new.perform }
          .to change { ActionMailer::Base.deliveries.count }.by(1)

        mail = ActionMailer::Base.deliveries.last
        expect(mail.to).to include user2.email
      end
    end
  end
end
