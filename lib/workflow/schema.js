import { Util } from "../utils/index.js"

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

  get postBook() {
    return {
      $id: "/API.postBook",
      type: "object",
      properties: Util.pick(
        BookSchema.properties,
        "current_page",
        "total_pages",
        "fbUserId",
        "title"
      ),
      required: ["fbUserId", "title", "total_pages", "current_page"],
    }
  },

  get deleteBook() {
    return {
      $id: "/API.deleteBook",
      type: "object",
      properties: Util.pick(BookSchema.properties, "title", "id", "fbUserId"),
      required: ["fbUserId", "title"],
    }
  },

  get patchBook() {
    return {
      $id: "/API.patchBook",
      type: "object",
      properties: Util.pick(
        BookSchema.properties,
        "current_page",
        "review",
        "finished",
        "fbUserId"
      ),
      required: ["fbUserId", "title"],
    }
  },
}

export { BookSchema }
