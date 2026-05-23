FactoryBot.define do
  factory :reminder do
    sequence(:email) { |n| "user#{n}@example.com" }
    notify_hour { 21 }
    active { true }
  end
end
