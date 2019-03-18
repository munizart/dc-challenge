const redis = require('redis')
const { RateLimiterRedis } = require('rate-limiter-flexible')
const checkSum = require('./check-sum')
const redisClient = redis.createClient({ enable_offline_queue: false })

const createLimiter = (routeName) => {
  return new RateLimiterRedis({
    storeClient: redisClient,
    points: 1,
    duration: 600, // 10min = 600s
    execEvenly: false,
    keyPrefix: `r-limiter-${routeName}`
  })
}

const limiterMiddleware = (routeName) => {
  const limiter = createLimiter(routeName)

  return (req, res, next) => {
    limiter
      .consume(checkSum(req.body))
      .then(() => next())
      .catch(() => {
        res.status(403).send('Forbidden')
      })
  }
}

module.exports = limiterMiddleware
