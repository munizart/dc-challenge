const fs = require('fs')
const rl = require('readline')

const createLineByLineReadStream = (path) => rl.createInterface({
  input: fs.createReadStream(path)
})

module.exports = createLineByLineReadStream
