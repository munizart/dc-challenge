/* eslint-disable no-self-compare */
const fc = require('fast-check')
const checkSum = require('../src/check-sum')

describe('part-1/check-sum', () => {
  it('always returns the same MD5 for the same input', () => {
    fc.property(fc.string16bits(), (a) => checkSum(a) === checkSum(a))
  })

  it('always returns a hexadecimal string', () => {
    fc.property(fc.string16bits(), (a) => !isNaN(parseInt(checkSum(a), 16)))
  })
})
