class Util {
  static pick(o, ...fields) {
    return Object.fromEntries(
      Object.entries(o).filter(([key, value]) => fields.includes(key))
    )
  }
}

export default Util
