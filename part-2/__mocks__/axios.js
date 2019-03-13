const { URL } = require('url')
const axios = jest.genMockFromModule('axios')

axios.__mock__ = () => {
  axios.get = jest.fn((url) => {
    const path = new URL(url).pathname
    if (path === '/not_found') {
      return Promise.reject(new Error(path))
    } else {
      return Promise.resolve(path)
    }
  })
}

module.exports = axios
