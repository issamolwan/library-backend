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

let newBook = {
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
    return mBook.post(newBook).then((result) => {
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

  it("should update a book record in database", () => {
    newBook = {
      fbUserId: "02u2jd9j1291j",
      title: "Thinking Fast And Slow",
      current_page: 320,
    }
    return mBook.patch(newBook).then((result) => {
      assert.deepEqual(result, {
        id: _insert1.id,
        finished: false,
        ...newBook
      })
    })
  })

  it("should insert a new book record into database", () => {
    newBook = {
      fbUserId: "02u2jd9j1sihdisaw",
      title: "Crime And Punishment",
      total_pages: 800,
      current_page: 242,
    }
    return mBook.post(newBook).then((result) => {
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
        // TODO: look up an easier way to do this
        fbUserId: newBook.fbUserId,
        title: newBook.title,
        total_pages: newBook.total_pages,
        current_page: newBook.current_page,
        finished: false,
        id: _insert1.id,
      })
    })
  })

  it("should not insert a new book record into database", () => {
    return mBook.post({ ...newBook }).catch((err) => {
      assert.equal(err.message, "BOOK_ALREADY_EXISTS")
    })
  })

  it("should get all books from database for a given user", () => {
    return mBook.get({ fbUserId: newBook.fbUserId }).then((result) => {
      assert.equal(result.length, 2)
    })
  })

  it("should not get a book record from database", () => {
    return mBook.get(_insert1.id).then((result) => {
      assert.deepEqual(result, undefined)
    })
  })

  it("should not update a book record in database", () => {
    return mBook.patch(_insert1.id, { current_page: 300 }).then((result) => {
      assert.deepEqual(result, undefined)
    })
  })

  it("should delete a book record from database", () => {
    return mBook.hardDelete(_insert1.id).then((result) => {
      assert.deepEqual(result, 1)
    })
  })

  it("should not delete a book record from database", () => {
    return mBook.hardDelete(_insert1.id).then((result) => {
      assert.deepEqual(result, 0)
    })
  })

  it("should soft delete a book record from database", () => {
    return mBook.delete(_insert1.id).then((result) => {
      assert.deepEqual(result, {
        ..._insert1,
        inactiveAt: result.inactiveAt,
      })
    })
  })
})
