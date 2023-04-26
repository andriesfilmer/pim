Rails.application.routes.draw do

  # Defines the root path route ("/")
  root "contacts#index"

  resources :contacts do
    collection do
      post 'search'
    end
  end

end
