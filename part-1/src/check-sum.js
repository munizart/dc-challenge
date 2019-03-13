const crypto = require('crypto')
/**
 * Takes some data in and outputs a MD5 checksum hash.
 * @param { String | Buffer | TypedArray | DataView } data
 * @returns { String }
 */
const checkSum = (data) =>
  crypto
    .createHash('MD5')
    .update(data)
    .digest('hex')

module.exports = checkSum
