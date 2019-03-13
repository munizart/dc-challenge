const path = require('path')
const createLineByLineReadStream = require('../line-by-line')

describe('file-by-line/createLineByLineReadStream', () => {
  it('creates a stream of lines from a file', (done) => {
    const callback = jest.fn()
    createLineByLineReadStream(path.join(__dirname, 'example-file'))
      .on('line', callback)
      .once('close', () => {
        expect(callback).toHaveBeenCalledTimes(3)
        expect(callback).toHaveBeenNthCalledWith(1, 'line')
        expect(callback).toHaveBeenNthCalledWith(2, 'by')
        expect(callback).toHaveBeenNthCalledWith(3, 'line')
        done()
      })
  })
})
