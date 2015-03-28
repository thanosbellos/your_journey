FactoryGirl.define do
  factory :user do
    sequence(:email) {|n| "foobar#{n}@mail.com"}
    password "foobar91"
    password_confirmation "foobar91"

    factory :invalid_user do
      password nil
    end

    factory :social_media_user do
      provider "facebook"
    end
   end

end
