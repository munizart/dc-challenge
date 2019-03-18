const axios = require('axios')

/**
 * @param { function (T) => U } fn
 * @template T, U
 */
const memoize = (fn) => {
  /** @type { Map<T, U> } */
  const cache = new Map()

  /**
   * @param { T }
   * @returns { U }
   */
  return (arg) => {
    if (cache.has(arg)) {
      return cache.get(arg)
    }

    const result = fn(arg)
    cache.set(arg, result)
    return result
  }
}
const memoGet = memoize(
  /**
   * @param { String } url
   * @return { Promise<AxiosResponse> }
   */
  (url) => axios.get(url)
)

module.exports = memoGet
