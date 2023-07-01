Rails.application.routes.draw do

  # Defines the root path route ("/")
  root "contacts#index"


  post "contactrestore", to: "contactversions#restore", as: "contactrestore"
  get "contactversions/compare", to: "contactversions#compare"
  #post "contactversions/compare", to: "contactversions#compare"

  resources :contactversions
  resources :contacts do
    collection do
      post 'search'
    end
  end

end
