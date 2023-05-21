import axios from "axios"
import { createClient } from "redis"

class Util {
  /**
   * Extracts the specified fields from an object and returns a new object containing only those fields.
   * @static
   * @param {Object} o - The input object.
   * @param {...string} fields - The names of the fields to include in the new object.
   * @returns {Object} A new object containing only the specified fields.
   */
  static pick(o, ...fields) {
    return Object.fromEntries(
      Object.entries(o).filter(([key, value]) => fields.includes(key))
    )
  }

  /**
   * Return metadata of a book by it's title
   * @static
   * @param {String} title
   * @returns {Promise<Object>} metadata of book
   */
  static async bookMetaData(title) {
    try {
      const client = createClient({
        url: "redis://redis:6379",
      })

      client.on("error", (error) => {
        console.error(error)
      })

      const cacheKey = `bookMetaData:${title}`
      
      const cachedData = await client.get(cacheKey)
      if (cachedData) {
        return JSON.parse(cachedData)
      }

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

      const { title: bookTitle, author_name: authorName, isbn } = response.data.docs[0]

      const randomIndex = isbn && isbn.length ? Math.floor(Math.random() * isbn.length) : 0

      url[0].medium = `https://covers.openlibrary.org/b/isbn/${isbn[randomIndex]}-M.jpg`
      url[1].large = `https://covers.openlibrary.org/b/isbn/${isbn[randomIndex]}-L.jpg`

      const metadata = { bookTitle, authorName, isbn, url }

      await client.set(cacheKey, JSON.stringify(metadata))

      return metadata
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default Util
