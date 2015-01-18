json.array!(@trails) do |trail|
  json.extract! trail, :id, :start, :destination, :travel_by, :rating
  json.url trail_url(trail, format: :json)
end
