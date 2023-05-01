"use strict"
import express from "express"
import { config } from "../config.js"
import Knex from "knex"
import { createRequire } from "module"
import { fileURLToPath } from "url"
import bodyParser from "body-parser"

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

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

    app.get("/v1/health", (req, res, next) => {
      res.context = { status: 200, content: "OK" }
      res.status(res.context.status).send(res.context.content)
      next()
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
