import Ajv from "ajv"
import moment from "moment-timezone"
import ajvFormats from "ajv-formats"
import { Book } from "../models/book.js"
import errors from "../utils/errors.js"
import Util from "../utils/index.js"

class Middleware {
  constructor(params) {
    this.knex = params.knex
    this.book = new Book(params)
  }

  async getBooks(req, res, next) {
    const { id } = req.params

    if (id) {
      let e = new Error(errors.MISSING_GET_PARAMETERS)
      e.statusCode = 400
    }

    req.books = await this.book.get({ fbUserId: id })
    next()
  }

  async postBook(req, res, next) {
    const params = req.body
    const id = req.params.id

    if (!params || !id) {
      let e = new Error(errors.MISSING_POST_PARAMETERS)
      e.statusCode = 400
    }

    let _book = Util.pick(params, "title", "total_pages", "current_page", "review")

    req.addBook = await this.book.post({ fbUserId: id, ..._book })
    next()
  }

  async deleteBook(req, res, next) {
    const { title } = req.body

    if (!title) {
      let e = new Error(errors.MISSING_DELETE_PARAMETERS)
    }

    const response = await this.book.delete(title)

    if (response.affectedRows == 1) {
      req.deleteBook = "Success"
    }
    next()
  }

  async patchBook(req, res, next) {
    const { id } = req.params
    const params = req.body

    if (!params || !id) {
      let e = new Error(errors.MISSING_PATCH_PARAMETERS)
      e.status = 400
    }

    let _book = Util.pick(params, "current_page", "total_pages", "review", "finished", "title")

    req.patchBook = await this.book.patch({ fbUserId: id, ..._book })

    next()
  }
}

export { Middleware }
