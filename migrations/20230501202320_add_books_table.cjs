"use strict"
let knex = require("knex")

exports.up = function (knex) {
  return knex.schema.createTable("books", (t) => {
    t.increments("id").unsigned().primary()
    t.datetime("createAt").notNull()
    t.datetime("updatedAt").nullable()
    t.datetime("inactiveAt").nullable()
    t.string("fbUserId", 128)
    t.string("title")
    t.integer("current_page")
    t.integer("total_pages")
    t.string("author")
    t.json("cover_url")
    t.text("review")
    t.boolean("finished").notNull().default(false)
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("books")
}
