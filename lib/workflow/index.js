import Ajv from "ajv"
import moment from "moment-timezone"
import ajvFormats from "ajv-formats"
import { Book } from "../models/book.js"
import errors from "../utils/errors.js"
import Util from "../utils/index.js"
import axios from "axios"
import { createClient } from "redis"
import { BookSchema } from "./schema.js"
import { getAuth } from "firebase-admin/auth"

class Middleware {
  constructor(params) {
    this.knex = params.knex
    this.book = new Book(params)
  }

  async getBooks(req, res, next) {
    const { id: fbUserId } = req.params

    fbUserId = (fbUserId) ? fbUserId : {}

    fbUserId = req.loginUser.fbUserId

    req.books = await this.book.get({ fbUserId: fbUserId })
    next()
  }

  async postBook(req, res, next) {
    const params = req.body

    const { id: fbUserId } = req.params
    fbUserId = (fbUserId) ? fbUserId : {}

    let ajv = ajvFormats(new Ajv({ removeAdditional: true, allowUnionTypes: true }))
    let _params = Object.assign({}, params, { fbUserId })
    const _validate = ajv.compile(BookSchema.postBook)
    let isValid = _validate(_params)

    if (!isValid) {
      let e = new Error(errors.BOOK_POST_VALIDATION_ERROR)
      e.statusCode = 400
      e.info = _validate.errors

      return Promise.reject(e)
    }

    try {
      const { url: cover_url, authorName: author } = await this.redisClient(_params.title)

      _params = Object.assign({}, _params, { cover_url, author })

      let _book = Util.pick(
        _params,
        "title",
        "total_pages",
        "current_page",
        "review",
        "fbUserId",
        "cover_url",
        "author"
      )

      req.addBook = await this.book.post(_book)
    } catch (err) {
      console.error(err)

      return Promise.reject(err)
    }
    next()
  }

  async deleteBook(req, res, next) {
    const { title } = req.body

    const { id: fbUserId } = req.params
    fbUserId = (fbUserId) ? fbUserId : {}

    const response = await this.book.delete({ ...fbUserId, title })

    if (response.affectedRows === 1) {
      res.status(200).json({
        success: true,
      })
    } else {
      res.status(400).json({
        error: "Book not found",
      })
    }
  }

  async patchBook(req, res, next) {
    const { id: fbUserId } = req.params
    const params = req.body

    let _book = Util.pick(params, "current_page", "total_pages", "review", "finished", "title")

    req.patchBook = await this.book.patch({ ..._book, fbUserId })

    next()
  }

  /**
   * Return metadata of a book by it's title
   * @param {String} title
   * @returns {Promise<Object>} metadata of book
   */
  async bookMetaData(title) {
    try {
      let url = [
        {
          medium: "",
        },
        {
          large: "",
        },
      ]

      const response = await axios.get("http://openlibrary.org/search.json", {
        params: {
          q: `${title}`,
        },
      })

      let { title: bookTitle, author_name: authorName, isbn } = response.data.docs[0]

      const index = isbn && isbn.length ? 0 : null

      url[0].medium = `https://covers.openlibrary.org/b/isbn/${isbn[index]}-M.jpg`
      url[1].large = `https://covers.openlibrary.org/b/isbn/${isbn[index]}-L.jpg`

      // sometimes the author name is returned as array of authors
      if (authorName.length) {
        authorName = authorName[0]
      }

      const metadata = { bookTitle, authorName, isbn, url }

      return metadata
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async redisClient(title) {
    try {
      const client = createClient({
        url: "redis://redis:6379",
      })

      client.on("error", (err) => {
        console.error(err)
      })

      await client.connect()

      const cacheKey = `book-data:${title}`
      const cacheResults = await client.get(cacheKey)
      if (cacheResults) {
        return JSON.parse(cacheResults)
      }

      const bookMetaData = await this.bookMetaData(title)
      await client.set(cacheKey, JSON.stringify(await this.bookMetaData(title)))

      await client.disconnect()

      return bookMetaData
    } catch (err) {
      console.error(err)
    }
  }
}


class AuthMiddleware {
  constructor(params) {
    this.knex = params.knex
    this.fbAuth = getAuth(params.fbApp)
  }

  authenticate() {
    return async (req, res, next) => {
      try {
        const decodedToken = await this.fbAuth.verifyIdToken(req.headers.authentication)
        req.loginUser = {
          fbUserId: decodedToken.uid,
          firebase: decodedToken.firebase,
          phone_number: decodedToken.phone_number
        }
      }
      catch (err) {
        let e = new Error(errors.AUTHORIZATION_ERROR)
        e.statusCode = 401
        return Promise.reject(e)
      }
      await next()
    }
  }
}

export { Middleware, AuthMiddleware }
