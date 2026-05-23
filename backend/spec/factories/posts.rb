FactoryBot.define do
  factory :post do
    sequence(:posted_on) { |n| Date.current - n }
    content { "今日のひとこと" }
  end
end
