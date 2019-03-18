const redis = require('redis')
const { RateLimiterRedis } = require('rate-limiter-flexible')
const checkSum = require('./check-sum')
const redisClient = redis.createClient({
  enable_offline_queue: false,
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || '6379',
  url: process.env.REDIS_URL || null
})

const limiterMiddleware = (routeName) => {
  const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    points: 1,
    duration: 600, // 10min = 600s
    execEvenly: false,
    keyPrefix: `limiter-${routeName}`
  })

  return (req, res, next) => {
    limiter
      .consume(checkSum(req.body))
      .then(() => next())
      .catch(() => {
        res.status(403).send('Forbidden\n')
      })
  }
}

module.exports = limiterMiddleware
