"use strict"
import { Book, BookSchema } from "../../../lib/models/book.js"
import { assert } from "chai"
import knex from "knex"

describe("Book Schema", () => {
  it("should match post schema method", () => {
    assert.deepEqual(BookSchema.post, {
      $id: "/Book.post",
      type: "object",
      properties: {
        current_page: { type: "integer" },
        total_pages: { type: "integer" },
        fbUserId: { type: "string", maxLength: 128 },
        title: { type: "string" },
      },
      required: ["fbUserId", "title", "total_pages", "current_page"],
    })
  })
})

const newBook = {
  fbUserId: "02u2jd9j1291j",
  title: "Thinking Fast And Slow",
  total_pages: 400,
  current_page: 200,
}

let mBook
let _insert1
describe("Book", () => {
  before(() => {
    mBook = new Book({
      knex: knex({
        client: "mysql2",
        connection: {
          host: "library-mysql",
          user: "root",
          password: "root",
          database: "library",
        },
      }),
    })
  })

  it("should insert a new book record into database", () => {
    return mBook.post({ ...newBook }).then((result) => {
      _insert1 = result
      assert.isDefined(_insert1.id)
      assert.deepEqual(_insert1, {
        cover_url: [
          {
            medium: _insert1.cover_url[0].medium,
          },
          {
            large: _insert1.cover_url[1].large,
          },
        ],
        fbUserId: "02u2jd9j1291j",
        title: "Thinking Fast And Slow",
        total_pages: 400,
        current_page: 200,
        finished: false,
        id: _insert1.id,
      })
    })
  })

  
})
