import knex from "knex"
import errors from "../utils/errors"
import Util from "../utils"
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
   * @return {Promise<Object>} book object
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
   * @return {Promise<Array<Object>>} list of books
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

  get(params) {
    const { fbUserId } = params
    
    params.limit = params.limit ? params.limit : 10
    params.offset = params.offset ? params.offset : 0

    let raw = this.knex.select().from(tableName).where({ 'fbUserId': fbUserId })

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
      current_page: { type: "integer" },
      total_pages: { type: "integer" },
      author: { type: "string" },
      review: { type: "string" },
      finished: { type: "boolean" },
    }
  },

  get() {},
}
