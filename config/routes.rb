Rails.application.routes.draw do

  devise_for :users

  # Defines the root path route ("/")
  root "base#about"

  get "home", to: "base#index"
  get "welcome", to: "base#welcome"
  post "eventrestore", to: "eventversions#restore", as: "eventrestore"
  post "events/search", to: "events#search"
  get "eventversions/compare", to: "eventversions#compare"

  post "contactrestore", to: "contactversions#restore", as: "contactrestore"
  post "contacts/search", to: "contacts#search"
  get "contactversions/compare", to: "contactversions#compare"

  post "postrestore", to: "postversions#restore", as: "postrestore"
  post "posts/search", to: "posts#search"
  get "postversions/compare", to: "postversions#compare"

  resources :events
  resources :eventversions
  resources :contacts
  resources :contactversions
  resources :posts
  resources :postversions

end
