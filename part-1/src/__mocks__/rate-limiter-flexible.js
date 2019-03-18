/* eslint-disable prefer-promise-reject-errors */
const rl = jest.mock('rate-limiter-flexible')

const mockLimiter = {
  consume () {
    if (rl.blocking) {
      return Promise.reject()
    } else {
      return Promise.resolve()
    }
  }
}
rl.RateLimiterRedis = function () {
  return mockLimiter
}

module.exports = rl
