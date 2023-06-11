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

}

export default Util
