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

ActiveRecord::Schema.define(version: 20150519152055) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "postgis"

  create_table "activities", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "activities_users", id: false, force: :cascade do |t|
    t.integer "activity_id", null: false
    t.integer "user_id",     null: false
  end

  add_index "activities_users", ["activity_id", "user_id"], name: "index_activities_users_on_activity_id_and_user_id", using: :btree
  add_index "activities_users", ["user_id", "activity_id"], name: "index_activities_users_on_user_id_and_activity_id", using: :btree

  create_table "points", force: :cascade do |t|
    t.integer   "tracksegment_id"
    t.string    "name"
    t.geography "lonlatheight",    limit: {:srid=>4326, :type=>"point", :has_z=>true, :geographic=>true}
    t.datetime  "created_at",                                                                             null: false
    t.datetime  "updated_at",                                                                             null: false
  end

  add_index "points", ["tracksegment_id"], name: "index_points_on_tracksegment_id", using: :btree

  create_table "tracks", force: :cascade do |t|
    t.string    "name"
    t.geography "path",          limit: {:srid=>4326, :type=>"multi_line_string", :geographic=>true}
    t.geography "start",         limit: {:srid=>4326, :type=>"point", :geographic=>true}
    t.geography "finish",        limit: {:srid=>4326, :type=>"point", :geographic=>true}
    t.integer   "trail_id"
    t.datetime  "created_at",                                                                         null: false
    t.datetime  "updated_at",                                                                         null: false
    t.string    "trackgeometry"
    t.geography "merged_path",   limit: {:srid=>4326, :type=>"line_string", :geographic=>true}
  end

  add_index "tracks", ["trail_id"], name: "index_tracks_on_trail_id", using: :btree

  create_table "tracksegments", force: :cascade do |t|
    t.integer   "track_id"
    t.geography "tracksegment_path", limit: {:srid=>4326, :type=>"line_string", :geographic=>true}
    t.datetime  "created_at",                                                                       null: false
    t.datetime  "updated_at",                                                                       null: false
  end

  add_index "tracksegments", ["track_id"], name: "index_tracksegments_on_track_id", using: :btree

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

  add_index "trails_users", ["trail_id", "user_id"], name: "index_trails_users_on_trail_id_and_user_id", using: :btree
  add_index "trails_users", ["user_id", "trail_id"], name: "index_trails_users_on_user_id_and_trail_id", using: :btree

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

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  add_foreign_key "points", "tracksegments"
  add_foreign_key "tracksegments", "tracks"
end
