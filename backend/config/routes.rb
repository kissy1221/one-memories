Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      get "posts/today", to: "posts#today"
      resources :posts, only: [:index, :create]
      resources :reminders, only: [:create]
      get "reminders/unsubscribe", to: "reminders#unsubscribe"
    end
  end
end
