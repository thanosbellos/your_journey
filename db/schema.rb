# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150409160601) do

  create_table "activities", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "activities_users", id: false, force: :cascade do |t|
    t.integer "activity_id", null: false
    t.integer "user_id",     null: false
  end

  add_index "activities_users", ["activity_id", "user_id"], name: "index_activities_users_on_activity_id_and_user_id"
  add_index "activities_users", ["user_id", "activity_id"], name: "index_activities_users_on_user_id_and_activity_id"

  create_table "average_caches", force: :cascade do |t|
    t.integer  "rater_id"
    t.integer  "rateable_id"
    t.string   "rateable_type"
    t.float    "avg",           null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "overall_averages", force: :cascade do |t|
    t.integer  "rateable_id"
    t.string   "rateable_type"
    t.float    "overall_avg",   null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "points", force: :cascade do |t|
    t.integer  "tracksegment_id"
    t.string   "name"
    t.float    "latitude"
    t.float    "longitude"
    t.float    "elevation"
    t.string   "description"
    t.datetime "point_created_at"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
  end

  add_index "points", ["tracksegment_id"], name: "index_points_on_tracksegment_id"

  create_table "rates", force: :cascade do |t|
    t.integer  "rater_id"
    t.integer  "rateable_id"
    t.string   "rateable_type"
    t.float    "stars",         null: false
    t.string   "dimension"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "rates", ["rateable_id", "rateable_type"], name: "index_rates_on_rateable_id_and_rateable_type"
  add_index "rates", ["rater_id"], name: "index_rates_on_rater_id"

  create_table "rating_caches", force: :cascade do |t|
    t.integer  "cacheable_id"
    t.string   "cacheable_type"
    t.float    "avg",            null: false
    t.integer  "qty",            null: false
    t.string   "dimension"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "rating_caches", ["cacheable_id", "cacheable_type"], name: "index_rating_caches_on_cacheable_id_and_cacheable_type"

  create_table "tracks", force: :cascade do |t|
    t.integer  "trail_id"
    t.string   "name"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
    t.string   "gpx_file_name"
    t.string   "gpx_content_type"
    t.integer  "gpx_file_size"
    t.datetime "gpx_updated_at"
  end

  add_index "tracks", ["trail_id"], name: "index_tracks_on_trail_id"

  create_table "tracksegments", force: :cascade do |t|
    t.integer  "track_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "tracksegments", ["track_id"], name: "index_tracksegments_on_track_id"

  create_table "trails", force: :cascade do |t|
    t.string   "name"
    t.string   "start_point"
    t.string   "end_point"
    t.float    "length"
    t.float    "duration"
    t.integer  "rating"
    t.string   "travel_by"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "difficulty"
  end

  create_table "trails_users", id: false, force: :cascade do |t|
    t.integer "trail_id", null: false
    t.integer "user_id",  null: false
  end

  add_index "trails_users", ["trail_id", "user_id"], name: "index_trails_users_on_trail_id_and_user_id"
  add_index "trails_users", ["user_id", "trail_id"], name: "index_trails_users_on_user_id_and_trail_id"

  create_table "users", force: :cascade do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "provider"
    t.string   "uid"
    t.string   "name"
    t.string   "avatar"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true

end
