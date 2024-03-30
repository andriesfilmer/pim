# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2024_03_05_134459) do
  create_table "bookmarks", id: :integer, charset: "utf8mb4", collation: "utf8mb4_general_ci", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.string "mongo_id", limit: 100
    t.integer "user_id", default: 0, null: false
    t.string "title", limit: 100, null: false
    t.string "url"
    t.text "content"
    t.string "category", limit: 1024
    t.string "tags"
    t.integer "times_read", default: 0
    t.datetime "last_read", precision: nil, default: -> { "current_timestamp()" }
    t.datetime "created", precision: nil, default: -> { "current_timestamp()" }
    t.datetime "updated", precision: nil
    t.index ["user_id"], name: "user_id"
  end

  create_table "contacts", id: :integer, charset: "utf8mb4", collation: "utf8mb4_general_ci", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.string "mongo_id", limit: 100
    t.integer "user_id", default: 0, null: false
    t.string "phones", limit: 1024, default: "[]"
    t.string "emails", limit: 1024, default: "[]"
    t.string "addresses", limit: 1024, default: "[]"
    t.string "companies", limit: 1024, default: "[]"
    t.string "websites", limit: 1024, default: "[]"
    t.string "name", limit: 100, null: false
    t.date "birthdate"
    t.text "notes"
    t.string "phones_fax", limit: 50
    t.boolean "starred", default: false
    t.string "photo", limit: 100
    t.integer "times_read", default: 0
    t.datetime "last_read", precision: nil, default: -> { "current_timestamp()" }
    t.datetime "created", precision: nil, default: -> { "current_timestamp()" }
    t.datetime "updated", precision: nil, default: -> { "current_timestamp()" }
    t.index ["user_id"], name: "user_id"
  end

  create_table "contactversions", id: :integer, charset: "utf8mb4", collation: "utf8mb4_general_ci", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.integer "org_id", null: false
    t.integer "user_id", default: 0, null: false
    t.string "phones", limit: 1024, default: "[]"
    t.string "emails", limit: 1024, default: "[]"
    t.string "addresses", limit: 1024, default: "[]"
    t.string "companies", limit: 1024, default: "[]"
    t.string "websites", limit: 1024, default: "[]"
    t.string "name", limit: 100, null: false
    t.date "birthdate"
    t.text "notes"
    t.string "phones_fax", limit: 50
    t.boolean "starred", default: false
    t.string "photo", limit: 100
    t.integer "times_read", default: 0
    t.datetime "last_read", precision: nil
    t.datetime "created", precision: nil, default: -> { "current_timestamp()" }
    t.index ["org_id"], name: "org_id"
  end

  create_table "events", id: :integer, charset: "utf8mb4", collation: "utf8mb4_general_ci", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.integer "user_id", default: 0, null: false
    t.string "title", limit: 100, null: false
    t.text "description"
    t.datetime "start", precision: nil
    t.datetime "end", precision: nil
    t.string "className", limit: 1024, default: "appointment"
    t.boolean "allDay", default: true
    t.string "tz", limit: 100
    t.datetime "created", precision: nil, default: -> { "current_timestamp()" }
    t.datetime "updated", precision: nil, default: -> { "current_timestamp()" }
    t.index ["user_id"], name: "user_id"
  end

  create_table "eventversions", id: :integer, charset: "utf8mb4", collation: "utf8mb4_general_ci", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.integer "org_id", null: false
    t.integer "user_id", default: 0, null: false
    t.string "title", limit: 100, null: false
    t.text "description"
    t.datetime "start", precision: nil
    t.datetime "end", precision: nil
    t.string "className", limit: 1024, default: "appointment"
    t.boolean "allDay", default: true
    t.string "tz", limit: 100
    t.datetime "created", precision: nil, default: -> { "current_timestamp()" }
    t.index ["org_id"], name: "org_id"
  end

  create_table "passkeys", id: :integer, charset: "utf8mb4", collation: "utf8mb4_general_ci", force: :cascade do |t|
    t.integer "user_id", default: 0, null: false
    t.string "title", null: false
    t.string "username"
    t.string "password"
    t.string "url"
    t.text "notes"
    t.string "tags"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.datetime "last_read", precision: nil, default: -> { "current_timestamp()" }
    t.index ["user_id"], name: "user_id"
  end

  create_table "passkeyversions", id: :integer, charset: "utf8mb4", collation: "utf8mb4_general_ci", force: :cascade do |t|
    t.integer "org_id", default: 0, null: false
    t.integer "user_id", default: 0, null: false
    t.string "title", null: false
    t.string "username"
    t.string "password"
    t.string "url"
    t.text "notes"
    t.string "tags"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["user_id"], name: "user_id"
  end

  create_table "posts", id: :integer, charset: "utf8mb4", collation: "utf8mb4_general_ci", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.string "mongo_id", limit: 100
    t.integer "user_id", default: 0, null: false
    t.string "title", limit: 100, null: false
    t.string "description", limit: 1024
    t.text "content"
    t.column "type", "enum('article','hobby','note','todo','other')"
    t.string "tags", limit: 1024
    t.string "lang"
    t.string "public", limit: 100
    t.integer "times_read", default: 0
    t.datetime "created", precision: nil, default: -> { "current_timestamp()" }
    t.datetime "updated", precision: nil
    t.datetime "last_read", precision: nil, default: -> { "current_timestamp()" }
    t.index ["user_id"], name: "user_id"
  end

  create_table "postversions", id: false, charset: "utf8mb4", collation: "utf8mb4_general_ci", options: "ENGINE=MyISAM", force: :cascade do |t|
    t.integer "id", null: false, auto_increment: true
    t.integer "org_id", null: false
    t.integer "user_id", null: false
    t.string "title", limit: 100, null: false
    t.string "description", limit: 1024
    t.text "content"
    t.string "type"
    t.string "tags", limit: 1024, default: "[]"
    t.datetime "created", precision: nil, default: -> { "current_timestamp()" }
    t.index ["id"], name: "id"
    t.index ["org_id"], name: "org_id"
  end

  create_table "user", id: { type: :integer, limit: 2 }, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.string "email"
    t.string "name", limit: 100
    t.string "password", limit: 20
    t.boolean "active", default: true
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_general_ci", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

end
