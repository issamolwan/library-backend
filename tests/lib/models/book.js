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
      delete result.createAt
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

  it("should get a book record from database by its id", () => {
    return mBook.getById(_insert1.id).then((result) => {
      delete result.createAt
      let expectedResult = {
        ..._insert1,
        finished: 0,
        inactiveAt: null,
        review: null,
        updatedAt: null,
        author: "Daniel Kahneman",
      }
      assert.deepEqual(result, expectedResult)
    })
  })

  it("should update current page for a book record in database", () => {
    newBook = {
      fbUserId: _insert1.fbUserId,
      title: _insert1.title,
      current_page: 320,
    }
    return mBook.patch(newBook).then((result) => {
      assert.deepEqual(result, newBook)
    })
  })

  it("should update review of a book record in database", () => {
    newBook = {
      fbUserId: _insert1.fbUserId,
      title: _insert1.title,
      review:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,",
    }
    return mBook.patch(newBook).then((result) => {
      assert.deepEqual(result, newBook)
    })
  })

  it("should update reading status 'finished' of a book record in database", () => {
    newBook = {
      fbUserId: _insert1.fbUserId,
      title: _insert1.title,
      current_page: _insert1.total_pages,
    }
    return mBook.patch(newBook).then((result) => {
      assert.deepEqual(result, {
        finished: true,
        ...newBook,
      })
    })
  })

  it("should soft delete a record from database", () => {
    return mBook.delete(_insert1.id).then((result) => {
      assert.equal(result.affectedRows, 1)
    })
  })

  it("should delete a book record from database", () => {
    return mBook.hardDelete(_insert1.id).then((result) => {
      assert.deepEqual(result.affectedRows, 1)
    })
  })

  it("should not insert a new book record into database", () => {
    newBook = {
      ...newBook,
      current_page: _insert1.current_page,
      total_pages: _insert1.total_pages,
    }
    return mBook.post(newBook).catch((err) => {
      assert.equal(err.message, "BOOK_ALREADY_EXISTS")
    })
  })

  it("should not insert a new book record into database", () => {
    delete newBook.title
    return mBook.post(newBook).catch((err) => {
      assert.equal(err.message, "BOOK_POST_VALIDATION_ERROR")
    })
  })

  it("should not insert a new book record into database", () => {
    delete newBook.fbUserId
    return mBook.post(newBook).catch((err) => {
      assert.equal(err.message, "BOOK_POST_VALIDATION_ERROR")
    })
  })

  it("should not insert a new book record into database", () => {
    delete newBook.fbUserId
    delete newBook.title
    return mBook.post(newBook).catch((err) => {
      assert.equal(err.message, "BOOK_POST_VALIDATION_ERROR")
    })
  })

  it("should insert a new book record into database", () => {
    newBook = {
      fbUserId: "02u2jd9j1291j",
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
        fbUserId: newBook.fbUserId,
        title: newBook.title,
        total_pages: newBook.total_pages,
        current_page: newBook.current_page,
        finished: false,
        id: _insert1.id,
      })
    })
  })

  it("should update current page of a book record in database", () => {
    newBook = {
      fbUserId: _insert1.fbUserId,
      title: _insert1.title,
      current_page: 322,
    }
    return mBook.patch(newBook).then((result) => {
      assert.deepEqual(result, newBook)
    })
  })

  it("should update review of a book record in database", () => {
    newBook = {
      ...newBook,
      review: "This book is bussin",
    }
    delete newBook.current_page
    return mBook.patch(newBook).then((result) => {
      assert.deepEqual(result, newBook)
    })
  })

  it("should soft delete a record into database", () => {
    return mBook.delete(_insert1.id).then((result) => {
      assert.equal(result.affectedRows, 1)
    })
  })

  it("should get all books from database for a given user", () => {
    return mBook.get({ fbUserId: newBook.fbUserId }).then((result) => {
      assert.equal(result.length, 2)
    })
  })

  it("should delete a book record from database", () => {
    return mBook.hardDelete(_insert1.id).then((result) => {
      assert.deepEqual(result.affectedRows, 1)
    })
  })

  after(async () => {
    // TODO: don't forget to remove this once all tests are cleared
    await mBook.knex("books").del()
  })
})
