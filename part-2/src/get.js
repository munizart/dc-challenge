const axios = require('axios')

const memoize = (fn) => {
  const cache = new Map()
  return (arg) => {
    if (cache.has(arg)) {
      return cache.get(arg)
    }

    const result = fn(arg)
    cache.set(arg, result)
    return result
  }
}
const memoGet = memoize((url) => axios.get(url))

module.exports = memoGet
