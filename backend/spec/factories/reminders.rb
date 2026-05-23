FactoryBot.define do
  factory :reminder do
    sequence(:email) { |n| "user#{n}@example.com" }
  end
end
