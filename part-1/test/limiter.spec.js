/* eslint-disable prefer-promise-reject-errors */

jest.mock('rate-limiter-flexible')
const limiterMiddleware = require('../src/limiter')

const req1 = { body: 'test string' }
const req2 = { body: 'another test string' }

let blocking = false

const mockLimiter = {
  consume () {
    if (blocking) {
      return Promise.reject()
    } else {
      return Promise.resolve()
    }
  }
}

const createLimiter = () => mockLimiter

describe('part-1/limiter', () => {
  let limiter
  let res
  let send
  let status

  beforeEach(() => {
    limiter = limiterMiddleware('test', createLimiter)
    blocking = false

    send = jest.fn()
    status = jest.fn(() => ({
      send
    }))
    res = { status }
  })

  it('Accepts requests before points exceded', (done) => {
    limiter(req1, res, () => {
      expect(status).toHaveBeenCalledTimes(0)
      expect(send).toHaveBeenCalledTimes(0)
      limiter(req2, res, () => {
        expect(status).toHaveBeenCalledTimes(0)
        expect(send).toHaveBeenCalledTimes(0)
        done()
      })
    })
  })

  it('Rejects requests after points exceded', (done) => {
    const next = jest.fn()
    limiter(req1, res, () => {
      expect(status).toHaveBeenCalledTimes(0)
      expect(send).toHaveBeenCalledTimes(0)
      blocking = true
      limiter(req1, {
        status (status) {
          return {
            send (sended) {
              expect(next).toHaveBeenCalledTimes(0)
              expect(status).toBe(403)
              expect(sended).toBe('Forbidden')
              done()
            }
          }
        }
      }, next)
    })
  })
})
