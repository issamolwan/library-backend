import Ajv from "ajv"
import moment from "moment-timezone"
import ajvFormats from "ajv-formats"
import { Book } from "../models/book.js"
import errors from "../utils/errors.js"

class Middleware {
  constructor(params) {
    this.knex = params.knex
    this.book = new Book(params)
  }

  async getBooks(req, res, next) {
    let params = req.query

    if (!params) {
      let e = new Error(errors.MISSING_GET_PARAMETERS)
      e.statusCode = 400
    }

    let getBooks = await this.book.get(params)

    next()
  }

  async deleteBook(req, res, next) {}

  async patchBook(req, res, next) {}
}

export { Middleware }
