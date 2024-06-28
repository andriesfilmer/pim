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

ActiveRecord::Schema[7.1].define(version: 2024_03_30_131504) do
  create_table "contacts", force: :cascade do |t|
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
    t.string "tags", limit: 255
    t.string "phones_fax", limit: 50
    t.integer "starred", default: 0
    t.string "photo", limit: 100
    t.integer "times_read", default: 0
    t.datetime "last_read", precision: nil
    t.datetime "created", precision: nil
    t.datetime "updated", precision: nil
    t.index ["user_id"], name: "idx_contacts_user_id"
  end

  create_table "contactversions", force: :cascade do |t|
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
    t.string "tags", limit: 255
    t.string "phones_fax", limit: 50
    t.integer "starred", default: 0
    t.string "photo", limit: 100
    t.integer "times_read", default: 0
    t.datetime "last_read", precision: nil
    t.datetime "created", precision: nil
    t.index ["org_id"], name: "idx_contactversions_org_id"
  end

  create_table "events", force: :cascade do |t|
    t.integer "user_id", default: 0, null: false
    t.string "title", limit: 100, null: false
    t.text "description"
    t.datetime "start", precision: nil
    t.datetime "end", precision: nil
    t.string "className", limit: 1024, default: "appointment"
    t.string "tags", limit: 255
    t.integer "allDay", default: 1
    t.string "tz", limit: 100
    t.datetime "created", precision: nil
    t.datetime "updated", precision: nil
    t.index ["user_id"], name: "idx_events_user_id"
  end

  create_table "eventversions", force: :cascade do |t|
    t.integer "org_id", null: false
    t.integer "user_id", default: 0, null: false
    t.string "title", limit: 100, null: false
    t.text "description"
    t.datetime "start", precision: nil
    t.datetime "end", precision: nil
    t.string "className", limit: 1024, default: "appointment"
    t.string "tags", limit: 255
    t.integer "allDay", default: 1
    t.string "tz", limit: 100
    t.datetime "created", precision: nil
    t.index ["org_id"], name: "idx_eventversions_org_id"
  end

  create_table "passkey_shares", force: :cascade do |t|
    t.integer "passkey_id", null: false
    t.integer "user_id", null: false
    t.integer "linked_user_id", null: false
    t.string "email", limit: 255, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "passkeys", force: :cascade do |t|
    t.integer "user_id", default: 0, null: false
    t.string "title", limit: 255, null: false
    t.string "username", limit: 255
    t.string "password", limit: 255
    t.integer "twofa", default: 0
    t.string "url", limit: 255
    t.text "notes"
    t.string "tags", limit: 255
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.datetime "last_read", precision: nil
    t.index ["user_id"], name: "idx_passkeys_user_id"
  end

  create_table "passkeyversions", force: :cascade do |t|
    t.integer "org_id", default: 0, null: false
    t.integer "user_id", default: 0, null: false
    t.string "title", limit: 255, null: false
    t.string "username", limit: 255
    t.string "password", limit: 255
    t.integer "twofa", default: 0
    t.string "url", limit: 255
    t.text "notes"
    t.string "tags", limit: 255
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["user_id"], name: "idx_passkeyversions_user_id"
  end

  create_table "posts", force: :cascade do |t|
    t.integer "user_id", default: 0, null: false
    t.string "title", limit: 100, null: false
    t.text "content"
    t.string "type", limit: 20
    t.string "tags", limit: 1024
    t.string "lang", limit: 255
    t.integer "public"
    t.integer "times_read", default: 0
    t.datetime "created", precision: nil
    t.datetime "updated", precision: nil
    t.datetime "last_read", precision: nil
    t.index ["user_id"], name: "idx_posts_user_id"
  end

  create_table "postversions", force: :cascade do |t|
    t.integer "org_id", null: false
    t.integer "user_id", null: false
    t.string "title", limit: 100, null: false
    t.text "content"
    t.string "type", limit: 255
    t.string "tags", limit: 1024, default: "[]"
    t.datetime "created", precision: nil
    t.index ["id"], name: "idx_postversions_id"
    t.index ["org_id"], name: "idx_postversions_org_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name", limit: 255
    t.string "email", limit: 255, default: "", null: false
    t.string "encrypted_password", limit: 255, default: "", null: false
    t.string "reset_password_token", limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip", limit: 255
    t.string "last_sign_in_ip", limit: 255
    t.string "confirmation_token", limit: 255
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email", limit: 255
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token", limit: 255
    t.datetime "locked_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
