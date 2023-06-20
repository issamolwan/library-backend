"use strict"
import { Server, app } from "../../lib/app.js"
import supertest from "supertest"
import { assert } from "chai"
import { config } from "../../config.js"

describe("API Test", () => {
  let _server = new Server(config)
  let server = app.listen(80)

  let newBook
  let _insert1
  let expectedResult

  const mockToken = {
    iss: 'https://securetoken.google.com/auth-development-3c24d',
    aud: 'auth-development-3c24d',
    auth_time: 1677649256,
    user_id: '3b7F0KuYznx9atcTg7qSdJqWgHg1',
    sub: '3b7F0KuYznx9atcTg7qSdJqWgHg1',
    iat: 1677651596,
    exp: 1677655196,
    phone_number: '+972597192140',
    firebase: { identities: { phone: ['+972597192140'] }, sign_in_provider: 'phone' },
    uid: '3b7F0KuYznx9atcTg7qSdJqWgHg1'
  }
  

  it("should post a new book", (done) => {
    newBook = {
      fbUserId: "1234567890",
      title: "The Lord of the Rings",
      current_page: 0,
      total_pages: 1000,
    }
    supertest(server)
      .post(`/v1/users/${newBook.fbUserId}/books`)
      .send(newBook)
      .end((err, res) => {
        if (err) {
          done(err)
        }

        assert.equal(res.status, 200)
        assert.equal(res.body.results.title, newBook.title)
        assert.equal(res.body.results.current_page, newBook.current_page)
        assert.equal(res.body.results.total_pages, newBook.total_pages)
        assert.isDefined(res.body.results.cover_url)
        assert.isDefined(res.body.results.author)
        done()
      })
  })

  it("should not post a new book with same title", (done) => {
    supertest(server)
      .post(`/v1/users/${newBook.fbUserId}/books`)
      .send(newBook)
      .end((err, res) => {
        if (err) {
          done(err)
        }
        assert.equal(res.status, 400)
        assert.equal(res.body.error, "Book already exists")
        done()
      })
  })

  it("should get all books", (done) => {
    supertest(server)
      .get(`/v1/users/${newBook.fbUserId}/books`)
      .end((err, res) => {
        if (err) {
          done(err)
        }

        assert.equal(res.status, 200)
        assert.equal(res.body.results.length, 1)
        assert.equal(res.body.results[0].title, newBook.title)
        assert.equal(res.body.results[0].current_page, newBook.current_page)
        assert.equal(res.body.results[0].total_pages, newBook.total_pages)
        assert.isDefined(res.body.results[0].cover_url)
        assert.isDefined(res.body.results[0].author)
        done()
      })
  })

  it("should edit a book", (done) => {
    newBook = {
      ...newBook,
      current_page: 100,
    }
    expectedResult = {
      ...newBook,
    }
    supertest(server)
      .patch(`/v1/users/${newBook.fbUserId}/books`)
      .send(newBook)
      .end((err, res) => {
        if (err) {
          done(err)
        }

        assert.equal(res.status, 200)
        assert.deepEqual(res.body.results, expectedResult)
        done()
      })
  })

  it("should delete a book", (done) => {
    supertest(server)
      .delete(`/v1/users/${newBook.fbUserId}/books`)
      .send(expectedResult)
      .end((err, res) => {
        if (err) {
          done(err)
        }

        assert.equal(res.status, 200)
        assert.equal(res.body.success, true)
        done()
      })
  })

  after((done) => {
    _server
      .knex("books")
      .del()
      .then(() => done())
  })
})
