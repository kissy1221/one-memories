require 'rails_helper'

RSpec.describe SendRemindersJob, type: :job do
  describe '#perform' do
    let!(:reminder) { create(:reminder, email: 'user@example.com') }

    context '今日まだ投稿していない場合' do
      it 'リマインダーメールを送信する' do
        expect { SendRemindersJob.new.perform }
          .to change { ActionMailer::Base.deliveries.count }.by(1)

        mail = ActionMailer::Base.deliveries.last
        expect(mail.to).to include 'user@example.com'
        expect(mail.subject).to include '今日のひとことを書きましょう'
      end
    end

    context '今日すでに投稿済みの場合' do
      before { create(:post, posted_on: Date.current) }

      it 'メールを送信しない' do
        expect { SendRemindersJob.new.perform }
          .not_to change { ActionMailer::Base.deliveries.count }
      end
    end
  end
end
