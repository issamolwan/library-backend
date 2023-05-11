
class Middleware {
  constructor() {
    this.middlewares = []
  }

  use(fn) {
    this.middlewares.push(fn)
  }

  go(ctx) {
    const dispatch = (i) => {
      const fn = this.middlewares[i]
      if (!fn) return Promise.resolve()
      return Promise.resolve(fn(ctx, () => dispatch(i + 1)))
    }
    return dispatch(0)
  }
}
