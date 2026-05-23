FactoryBot.define do
  factory :post do
    association :user
    sequence(:posted_on) { |n| Date.current - n }
    content { "今日のひとこと" }
  end
end
