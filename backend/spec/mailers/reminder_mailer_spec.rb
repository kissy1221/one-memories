require "rails_helper"

RSpec.describe ReminderMailer, type: :mailer do
  describe "daily" do
    let(:reminder) { create(:reminder, email: "user@example.com") }
    let(:mail) { ReminderMailer.daily(reminder) }

    it "renders the headers" do
      expect(mail.subject).to eq("📝 今日のひとことを書きましょう")
      expect(mail.to).to eq(["user@example.com"])
    end

    it "renders the body" do
      expect(mail.text_part.body.decoded).to match("one memory")
    end
  end
end
