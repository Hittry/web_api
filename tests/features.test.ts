import { createServer } from '../src/server'
import Hapi, { AuthCredentials } from '@hapi/hapi'
import {describe, expect, test, beforeAll, afterAll} from '@jest/globals'
import { API_AUTH_STATEGY } from '../src/plugins/auth'
import { createUserCredentials } from './test-help'

describe('Test features plugin', () => {
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

  test('create dianon features as admin', async () => {
    const response = await server.inject({
      method: 'POST',
      url: `/dianons/${testAdminCredentials.userId}/features`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        tato: 'dragon',
        colour: 'blue',
        sex: `man`
      }
    })

    expect(response.statusCode).toEqual(201)
    userId = JSON.parse(response.payload)?.id
    expect(typeof userId === 'number').toBeTruthy()
  })

  test('get all dianons features', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/dianons/features',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testUserCredentials,
      },
    })
  
    console.log(response.payload)
    expect(response.statusCode).toEqual(200)
  })

  test('create dianon features validation', async () => {
    const response = await server.inject({
      method: 'POST',
      url: `/dianons/${testAdminCredentials.userId}/features`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        tato: 'dk'
      },
    })
  
    console.log(response.payload)
    expect(response.statusCode).toEqual(400)
  })

  test('update dianon features ', async () => {
    const tatoUpdate = 'test-first-name-UPDATED'

    const response = await server.inject({
      method: 'PUT',
      url: `/dianons/features/${testAdminCredentials.userId}`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        tato: tatoUpdate
      },
    })
    expect(response.statusCode).toEqual(200)
    const user = JSON.parse(response.payload)
    expect(user.tato).toEqual(tatoUpdate)
  })

  test('delete dianon features', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/dianons/features/${testAdminCredentials.userId}`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
    })
    expect(response.statusCode).toEqual(204)
  })

})