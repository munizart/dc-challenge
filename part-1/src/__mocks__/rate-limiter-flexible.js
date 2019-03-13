const rl = jest.mock('rate-limiter-flexible')
rl.RateLimiterRedis = rl.RateLimiterMemory

module.exports = rl
