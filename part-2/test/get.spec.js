jest.mock('axios')
const axios = require('axios')
const get = require('../src/get')

describe('part-2/get', () => {
  beforeEach(() => {
    axios.__mock__()
  })

  it('delegates only first calls to axios.get', async () => {
    expect.assertions(2) // certify catch block won't execute
    try {
      await get('http://mocked.server/test_path')
      await get('http://mocked.server/test_path')

      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.get).toHaveBeenCalledWith('http://mocked.server/test_path')
    } catch (error) {
      expect('failure').toBe('failure')
    }
  })

  it('is memoized properly', async () => {
    expect.assertions(2) // certify catch block won't execute
    try {
      let value = await get('http://mocked.server/test_path')
      expect(value).toBe('/test_path')

      value = await get('http://mocked.server/test_path')
      expect(value).toBe('/test_path')
    } catch (error) {
      expect('failure').toBe('failure')
    }
  })

  it('always rejects once failed', async () => {
    expect.assertions(4) // certify catchs block will be executed
    try {
      await get('http://mocked.server/not_found')
    } catch (error) {
      expect(error.message).toBe('/not_found')
    }

    try {
      await get('http://mocked.server/not_found')
    } catch (error) {
      expect(error.message).toBe('/not_found')
    }

    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get).toHaveBeenCalledWith('http://mocked.server/not_found')
  })
})
