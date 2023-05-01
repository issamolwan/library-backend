import knex from "knex"
import errors from "../utils/errors"
import Util from "../utils"
import Ajv from "ajv"
import moment from "moment-timezone"
import ajvFormats from "ajv-formats"

// get all books
// get a single book
// post a new book
// post new books
const tableName = "books"

class Book {
  constructor(params) {
    this.knex = params.knex
  }
  /**
   * get a single book object
   * @param {String} id of a book
   * @returns {Promise<Object>} book object
   */
  getById(id) {
    let raw = this.knex.select().from(tableName).where({ id: id }).toSQL()
    return this.knex.raw(raw.sql, raw.bindings).then((result) => {
      if (result[0].length > 1) {
        let e = new Error(errors.GET_BOOK_BY_ID)
        e.statusCode = 400
        throw e
      }
      return result[0][0]
    })
  }

  /**
   * get a list of all books by author
   * @param {Object} params to search by author name
   *    - {string} fbUserId - firebase user id
   *    - {string} author - name of the author
   * @returns {Promise<Array<Object>>} list of books
   */
  getByAuthor(params) {
    const { fbUserId, author } = params

    params.limit = params.limit ? params.limit : 10
    params.offset = params.offset ? params.offset : 0

    let query = this.knex.select().from(tableName)
    let _where = {}

    if (fbUserId) {
      _where.fbUserId = fbUserId
    }
    if (author) {
      _where.author = author
    }

    query = query.where(_where)

    let raw = this.knex
      .select()
      .from(tableName)
      .where({ author: params.author, fbUserId: params.fbUserId })
      .toSQL()
    return this.knex.raw(raw.sql, raw.bindings).then((result) => {
      return result[0][0]
    })
  }

  /**
   * get a list of all books for specific user
   * @param {Object} params
   *  - {string} fbUserId - firebase user id
   * @returns {Promise<Array<Object>>} list of book objects
   */
  get(params) {
    const { fbUserId } = params

    params.limit = params.limit ? params.limit : 10
    params.offset = params.offset ? params.offset : 0

    if (!fbUserId) {
      let e = new Error(errors.GET_BOOKS)
      e.statusCode = 400
      throw e
    }

    let raw = this.knex
      .select()
      .from(tableName)
      .where({ fbUserId: fbUserId })
      .toSQL()
    return this.knex.raw(raw.sql, raw.bindings).then((result) => {
      return result[0][0]
    })
  }

  post(book = {}) {
    let ajv = ajvFormats(
      new Ajv({ removeAdditionalFields: true, allowUnionTypes: true })
    )
    let _book = Object.assign({}, book)
    const _validate = ajv.compile(BookSchema.post)
    let isValid = _validate(_book)

    if (!isValid) {
      let e = new Error(errors.BOOK_POST_VALIDATION_ERROR)
      e.statusCode = 400
      e.info = _validate.error

      return Promise.reject(e)
    }

    // check if book in parameter exists
    const { fbUserId, title } = _book
    let raw = this.knex
      .select()
      .where({ title: title, fbUserId: fbUserId })
      .limit(2)
      .toSQL()
    return this.knex.raw(raw.sql, raw.bindings).then((result) => {
      if (result[0].length) {
        let e = new Error(errors.BOOK_DOES_NOT_EXIST)
        e.statusCode = 400
        throw e
      }

      // if inserted book is not finished
      if (_book.current_page != book.total_pages) {
        _book.finished = false
      }
      _book.finished = true

      raw = this.knex
        .from(tableName)
        .where({ title: title, fbUserId: fbUserId })
        .insert({
          ..._book,
          createAt: moment().utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .toSQL()
      return this.knex.raw(raw.sql, raw.bindings).then((result) => {
        return {
          id: result[0].insertId,
          ..._book,
        }
      })
    })
  }
}

const BookSchema = {
  get properties() {
    return {
      id: { type: ["integer", "string"] },
      createAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      inactiveAt: { type: "string", format: "date-time" },
      fbUserId: { type: "string", maxLength: 128 },
      title: { type: "string" },
      current_page: { type: "integer" },
      total_pages: { type: "integer" },
      author: { type: "string" },
      review: { type: "string" },
      finished: { type: "boolean" },
    }
  },

  post() {
    return {
      id: "/Book.post",
      type: "object",
      properties: Util.pick(
        BookSchema.properties,
        "current_page",
        "total_pages",
        "fbUserId",
        "title"
      ),
      required: ["fbUserId", "current_page", "title"],
    }
  },
}

export { Book, BookSchema }
