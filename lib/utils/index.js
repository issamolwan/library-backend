import axios from "axios"

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

      const {
        title: bookTitle,
        author_name: authorName,
        isbn,
      } = response.data.docs[0]

      const randomIndex = Math.floor(Math.random() * isbn.length)

      url[0].medium = `https://covers.openlibrary.org/b/isbn/${isbn[randomIndex]}-M.jpg`
      url[1].large = `https://covers.openlibrary.org/b/isbn/${isbn[randomIndex]}-L.jpg`

      return { bookTitle, authorName, isbn, url }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}

export default Util
