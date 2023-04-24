Rails.application.routes.draw do
  resources :contacts

  # Defines the root path route ("/")
  root "contacts#index"

  get "/contacts", to: "contacts#index"

end
