const express = require('express')
const bodyParser = require('body-parser')
const limiterMiddleware = require('./limiter')
const DEV_PORT = 3001
const PORT = process.env.PORT || DEV_PORT
const app = express()

app.use(bodyParser.text({ limit: '2gb', type: '*/*' }))

app.post('/v1/products', limiterMiddleware('products'), (req, res) => {
  // update logic here
  res.status(200).send('ok\n')
})

app.listen(PORT, () => {
  console.log(`server running on port: ${PORT}`)
})
