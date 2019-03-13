const { EventEmitter } = require('events')
const createLineByLineStream = require('../line-by-line')

/**
 * Sequence is a abstract data type that allows
 * complex data flows to be expressed clearly and concisely.
 * @example
   ```javascript
   const { fromArray } = require('sequence')
   fromArray([1, 2, 3])
     .map(x => x * x)
     .filter(x => x > 2)
     .reduce((a, b) => a + b, 0) // Promise<Number>(13)
   ```
 * @template T
 */
class Sequence extends EventEmitter {
  /**
   * @param { (onData: (data: T) => void, onClose: () => void) => void } initializer
   */
  constructor (initializer) {
    super()
    initializer(
      (data) => process.nextTick(() => this.emit('data', data)),
      () => process.nextTick(() => this.emit('close'))
    )
  }

  /**
   * Maps over a sequence using `mapper` to create a new sequence
   * @param { (a: T) => U } mapper
   * @return { Sequence<U> }
   * @template U
   */
  map (mapper) {
    return new Sequence((onData, onClose) => {
      this.on('data', (value) => {
        onData(mapper(value))
      })
      this.once('close', onClose)
    })
  }

  /**
   * Filters a sequence removing anything that fails
   * the predicate.
   * @param { (a: T) => Boolean } predicate
   */
  filter (predicate) {
    return new Sequence((onData, onClose) => {
      this.on('data', (data) => {
        if (predicate(data)) {
          onData(data)
        }
      })
      this.once('close', onClose)
    })
  }

  /**
   * Returns a Promise to a single item by iterating through the sequence,
   * successively calling the reducer function and passing it an accumulator value
   * and the current data from the sequence, and then passing the result to the next call.
   *
   * The iterator function receives two values: (accumulator, data).
   *
   * @param { (accumulator: U, data: T) => U } reducer
   * @param { U } initializer
   * @return { Promise<U> }
   * @template U
   */
  reduce (reducer, initializer) {
    return new Promise((resolve) => {
      let accumulator = initializer
      this.on('data', (data) => {
        accumulator = reducer(accumulator, data)
      })
      this.once('close', () => {
        resolve(accumulator)
      })
    })
  }

  /**
   * Creates a sequence from an array
   * @param { U[] } array
   * @return { Sequence<U> }
   * @template U
   */
  static fromArray (array) {
    return new Sequence((onData, onClose) => {
      array.forEach(onData)
      onClose()
    })
  }

  /**
   * Generates a sequence from a EventEmitter
   * @param { EventEmitter } emitter
   * @param { String } [dataEvent='data'] The name of the event that produces data
   * @param { String } [closeEvent='close'] The name of the event that finishes the sequence
   * @return { Sequence }
   * @template U
   */
  static fromEmitter (emitter, dataEvent = 'data', closeEvent = 'close') {
    return new Sequence((onData, onClose) => {
      emitter.on(dataEvent, onData)
      emitter.on(closeEvent, onClose)
    })
  }

  /**
   * Creates a sequence for reading a file, line by line.
   * @param { String } path Path to the file
   * @return { Sequence<String> }
   */
  static fromFile (path) {
    const stream = createLineByLineStream(path)
    return Sequence.fromEmitter(
      stream,
      'line',
      'close'
    )
  }
}

module.exports = Sequence
