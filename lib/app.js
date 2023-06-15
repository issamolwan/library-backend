"use strict"
import express from "express"
import { config } from "../config.js"
import Knex from "knex"
import { createRequire } from "module"
import { fileURLToPath } from "url"
import bodyParser from "body-parser"
import { Middleware } from "./workflow/index.js"

const app = express()
app.use(express.json())

class Server {
  constructor(_config) {
    this.knex = Knex({
      client: "mysql2",
      connection: {
        host: config.mysql.host,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database,
        port: config.mysql.port || 3306,
        ssl: config.mysql.ssl || false,
      },
      pool: { min: 0, max: 20 },
    })

    this.middleware = new Middleware({
      knex: this.knex,
    })

    app.get("/v1/health", (req, res, next) => {
      res.context = { status: 200, content: "OK" }
      res.status(res.context.status).send(res.context.content)
      next()
    })

    app.get(
      "/v1/users/:id/books",
      /**
       * User authentication
       */
      this.middleware.getBooks.bind(this.middleware),
      (req, res) => {
        res.json({
          results: req.books,
          status: 200,
        })
      }
    )

    app.post(
      "/v1/users/:id/books",
      this.middleware.postBook.bind(this.middleware),
      (req, res) => {
        res.send({
          results: req.addBook,
          status: 200,
        })
      }
    )

    app.delete(
      "/v1/users/:id/books",
      this.middleware.deleteBook.bind(this.middleware),
      (req, res) => {
        res.send({
          results: req.deleteBook,
          status: 200,
        })
      }
    )

    app.patch(
      "/v1/users/:id/books",
      this.middleware.patchBook.bind(this.middleware),
      (req, res) => {
        res.send({
          results: req.patchBook,
          status: 200,
        })
      }
    )

    app.use((err, req, res, next) => {
      console.error(err.stack)
      res.status(500).send("Something broke!")
    })
  }
}

const require = createRequire(import.meta.url)
const scriptPath = require.resolve(process.argv[1])
const modulePath = fileURLToPath(import.meta.url)
if (scriptPath === modulePath) {
  let _server = new Server(config)

  const server = app.listen(config.port, () => {
    console.log(`Server listening on port: ${config.port}`)
  })
}

export { Server, app }
