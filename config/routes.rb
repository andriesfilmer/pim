Rails.application.routes.draw do

  #devise_for :users
  devise_for :users, controllers: { registrations: 'registrations' }

  authenticated  do
    root "base#index", as: 'unauthenticated_user'
  end
  unauthenticated do
    root "base#about"
  end

  get "about", to: "base#about"
  get "welcome", to: "base#welcome"
  post "offline_data", to: "base#update_offline_data"

  get "events/drag", to: "events#drag"
  post "events/search", to: "events#search"
  post "eventrestore", to: "event_versions#restore", as: "eventrestore"
  get "event_versions/compare", to: "event_versions#compare"

  post "contactrestore", to: "contact_versions#restore", as: "contactrestore"
  post "contacts/search", to: "contacts#search"
  get "contact_versions/compare", to: "contact_versions#compare"

  post "postrestore", to: "post_versions#restore", as: "postrestore"
  post "posts/search", to: "posts#search"
  delete "post/image", to: "posts#destroy_image"
  get "post_versions/compare", to: "post_versions#compare"

  post "passkeyrestore", to: "passkey_versions#restore", as: "passkeyrestore"
  post "passkeys/search", to: "passkeys#search"
  get "passkeys/:id/password", to: "passkeys#password", as: "passkey_password"
  get "passkey_versions/compare", to: "passkey_versions#compare"

  resources :events
  resources :event_versions
  resources :contacts
  resources :contact_versions
  resources :posts
  resources :post_versions
  resources :passkeys
  resources :passkey_versions
  resources :passkey_shares

end
