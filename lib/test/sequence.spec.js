const { join } = require('path')
const Sequence = require('../sequence')
const { EventEmitter } = require('events')

describe('Sequence', () => {
  describe('.fromArray', () => {
    it('creates a sequence from an array', (done) => {
      const callback = jest.fn()
      Sequence
        .fromArray([1, 2, 3])
        .on('data', callback)
        .once('close', () => {
          expect(callback).toHaveBeenCalledTimes(3)
          expect(callback).toHaveBeenNthCalledWith(1, 1)
          expect(callback).toHaveBeenNthCalledWith(2, 2)
          expect(callback).toHaveBeenNthCalledWith(3, 3)
          done()
        })
    })
  })

  describe('.fromEmmiter', () => {
    const emitter = new EventEmitter()
    it('Generates a sequence from a EventEmitter', (done) => {
      const sequence = Sequence.fromEmitter(emitter)
      const callback = jest.fn()
      sequence.on('data', callback)

      emitter.emit('data', 1)
      emitter.emit('data', 2)
      emitter.emit('data', 3)

      sequence.once('close', () => {
        expect(callback).toHaveBeenCalledTimes(3)
        expect(callback).toHaveBeenNthCalledWith(1, 1)
        expect(callback).toHaveBeenNthCalledWith(2, 2)
        expect(callback).toHaveBeenNthCalledWith(3, 3)
        done()
      })

      emitter.emit('close')
    })
  })

  describe('.fromFile', () => {
    it('Generates a sequence from a file', (done) => {
      const sequence = Sequence.fromFile(join(__dirname, 'example-file'))
      const callback = jest.fn()
      sequence.on('data', callback)

      sequence.once('close', () => {
        expect(callback).toHaveBeenCalledTimes(3)
        expect(callback).toHaveBeenNthCalledWith(1, 'line')
        expect(callback).toHaveBeenNthCalledWith(2, 'by')
        expect(callback).toHaveBeenNthCalledWith(3, 'line')
        done()
      })
    })
  })

  describe('#map', () => {
    it('Maps over a sequence using mapper to create a new sequence', (done) => {
      const callback1 = jest.fn((x) => x + 1)
      const callback2 = jest.fn()

      Sequence
        .fromArray([1, 2, 3])
        .map(callback1)
        .on('data', callback2)
        .once('close', () => {
          expect(callback1).toHaveBeenCalledTimes(3)
          expect(callback1).toHaveBeenNthCalledWith(1, 1)
          expect(callback1).toHaveBeenNthCalledWith(2, 2)
          expect(callback1).toHaveBeenNthCalledWith(3, 3)

          expect(callback2).toHaveBeenCalledTimes(3)
          expect(callback2).toHaveBeenNthCalledWith(1, 2)
          expect(callback2).toHaveBeenNthCalledWith(2, 3)
          expect(callback2).toHaveBeenNthCalledWith(3, 4)
          done()
        })
    })
  })

  describe('#filter', () => {
    it('Filters a sequence removing anything that fails the predicate', (done) => {
      const callback1 = jest.fn((x) => x > 2)
      const callback2 = jest.fn()

      Sequence
        .fromArray([1, 2, 3])
        .filter(callback1)
        .on('data', callback2)
        .once('close', () => {
          expect(callback1).toHaveBeenCalledTimes(3)
          expect(callback1).toHaveBeenNthCalledWith(1, 1)
          expect(callback1).toHaveBeenNthCalledWith(2, 2)
          expect(callback1).toHaveBeenNthCalledWith(3, 3)

          expect(callback2).toHaveBeenCalledTimes(1)
          expect(callback2).toHaveBeenNthCalledWith(1, 3)
          done()
        })
    })
  })

  describe('#reduce', () => {
    const add = (x, y) => x + y
    const mult = (x, y) => x * y
    const eq = (a) => (b) => {
      expect(a).toEqual(b)
    }

    it('folds simple functions over sequence with the supplied accumulator', () => {
      const oneToFour = Sequence.fromArray([1, 2, 3, 4])

      return Promise.all([
        oneToFour.reduce(add, 0).then(eq(10)),
        oneToFour.reduce(mult, 1).then(eq(24)),
        oneToFour.reduce(mult, 0).then(eq(0))
      ])
    })
  })
})
