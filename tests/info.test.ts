import { createServer } from '../src/server'
import Hapi, { AuthCredentials } from '@hapi/hapi'
import {describe, expect, test, beforeAll, afterAll} from '@jest/globals'
import { API_AUTH_STATEGY } from '../src/plugins/auth'
import { createUserCredentials } from './test-help'

describe('Test information about person plugin', () => {
  let server: Hapi.Server
  let testUserCredentials: AuthCredentials
  let testAdminCredentials: AuthCredentials

  beforeAll(async () => {
    server = await createServer()
    testUserCredentials = await createUserCredentials(server.app.prisma, false)
    testAdminCredentials = await createUserCredentials(server.app.prisma, true)
  })

  afterAll(async () => {
    await server.stop()
  })

  let userId: number

  test('create dianon person info as admin', async () => {
    const response = await server.inject({
      method: 'POST',
      url: `/dianons/${testAdminCredentials.userId}/info`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        passport: '1232321',
        telephone: '7878787887'
      }
    })

    expect(response.statusCode).toEqual(201)
    userId = JSON.parse(response.payload)?.id
    expect(typeof userId === 'number').toBeTruthy()
  })

  test('get all dianons personal info', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/dianons/info',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testUserCredentials,
      },
    })
  
    console.log(response.payload)
    expect(response.statusCode).toEqual(200)
  })

  test('create dianon personal info validation', async () => {
    const response = await server.inject({
      method: 'POST',
      url: `/dianons/${testAdminCredentials.userId}/features`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        passport: 'dkjhjhhj'
      },
    })
  
    console.log(response.payload)
    expect(response.statusCode).toEqual(400)
  })

  test('update dianon personal info', async () => {
    const telephoneUpdated = 'telephone-UPDATED'

    const response = await server.inject({
      method: 'PUT',
      url: `/dianons/info/${testAdminCredentials.userId}`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        telephone: telephoneUpdated
      },
    })
    expect(response.statusCode).toEqual(200)
    const user = JSON.parse(response.payload)
    expect(user.telephone).toEqual(telephoneUpdated)
  })

  test('delete dianon personal info', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/dianons/info/${testAdminCredentials.userId}`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
    })
    expect(response.statusCode).toEqual(204)
  })

})