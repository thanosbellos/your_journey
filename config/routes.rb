Rails.application.routes.draw do




  post '/rate' => 'rater#create', :as => 'rate'
  get 'trail_searches/new'

  get 'trail_searches/index'

  get 'trails/difficult' => 'trails#most_difficult'

  get 'trails/best' => 'trails#best_trails'
  devise_for :users, :controllers => { :omniauth_callbacks => 'users/omniauth_callbacks' ,
                                       :registrations=> 'users/registrations' }
  resources :users , only: [:show, :index] do
     resources :trails

  end
  resources :trails , only: [:index] do
    resources :photos
    resources :comments
  end
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
   get 'static_pages/home'
   root 'static_pages#home'
   get 'trail_searches/index'
   get 'export' => 'static_pages#export'

   post 'search' => 'trail_searches#search'
    #get 'signup' => 'users#new'
  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
