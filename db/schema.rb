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
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120416123952) do

  create_table "buddies", :force => true do |t|
    t.string   "name"
    t.string   "nickname"
    t.string   "status"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "salesforce_id"
    t.string   "small_photo_url"
    t.integer  "org_id"
    t.datetime "date_login"
  end

  create_table "buffers", :force => true do |t|
    t.integer  "buddy_id"
    t.string   "channel"
    t.string   "message"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "channels", :force => true do |t|
    t.string   "key"
    t.string   "mod"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "connections", :force => true do |t|
    t.integer  "buddy_id"
    t.integer  "channel_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "orgs", :force => true do |t|
    t.string   "org_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "rosters", :force => true do |t|
    t.integer  "buddy_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "count",      :default => 0
  end

  create_table "sessions", :force => true do |t|
    t.integer  "buddy_id"
    t.string   "name"
    t.datetime "expires_at"
    t.string   "salt"
    t.string   "token"
    t.string   "instance_url"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "settings", :force => true do |t|
    t.integer  "skin"
    t.integer  "history"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "buddy_id"
    t.integer  "idle_time",    :default => 10
    t.string   "msg_style"
    t.integer  "use_picture"
    t.boolean  "show_offline", :default => false
  end

  create_table "skins", :force => true do |t|
    t.string   "name"
    t.string   "css"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
