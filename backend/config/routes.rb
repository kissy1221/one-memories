Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      get "posts/today", to: "posts#today"
      get "posts/streak", to: "posts#streak"
      resources :posts, only: [:index, :create]
    end
  end
end
