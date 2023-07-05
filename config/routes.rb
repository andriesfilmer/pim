Rails.application.routes.draw do

  # Defines the root path route ("/")
  root "contacts#index"

  post "contactrestore", to: "contactversions#restore", as: "contactrestore"
  post "contacts/search", to: "contacts#search"
  get "contactversions/compare", to: "contactversions#compare"

  post "postrestore", to: "postversions#restore", as: "postrestore"
  post "posts/search", to: "posts#search"
  get "postversions/compare", to: "postversions#compare"

  resources :contactversions
  resources :contacts
  resources :posts
  resources :postversions

end
