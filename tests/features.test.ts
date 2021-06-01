import { createServer } from '../src/server'
// @ts-ignore
import Hapi, { AuthCredentials, FeatCredentials, DianonCredentials } from '@hapi/hapi'
import {describe, expect, test, beforeAll, afterAll} from '@jest/globals'
import { API_AUTH_STATEGY } from '../src/plugins/auth'
import { createUserCredentials } from './test-help'
import { createFeatCredentials } from './test-help-feat'

describe('Test features plugin', () => {
  let server: Hapi.Server
  let testUserCredentials: AuthCredentials
  let testAdminCredentials: AuthCredentials
  let testFeatCredentials: FeatCredentials

  beforeAll(async () => {
    server = await createServer()
    testUserCredentials = await createUserCredentials(server.app.prisma, false)
    testAdminCredentials = await createUserCredentials(server.app.prisma, true)
    testFeatCredentials = await createFeatCredentials(server.app.prisma)
  })

  afterAll(async () => {
    await server.stop()
  })

  let userId: number

  test('create dianon features as admin', async () => {
    const responseDianon = await server.inject({
      method: 'POST',
      url: '/dianons',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        firstName: 'test-first-name',
        lastName: 'test-last-name',
        email: `test-${Date.now()}@prisma.io`
      }
    })
    expect(responseDianon.statusCode).toEqual(201)

    userId = JSON.parse(responseDianon.payload)?.id

    const response = await server.inject({
      method: 'POST',
      url: `/dianons/${userId}/features`,
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
    const responseDianon = await server.inject({
      method: 'POST',
      url: '/dianons',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        firstName: 'test-first-name',
        lastName: 'test-last-name',
        email: `test-${Date.now()}@prisma.io`
      }
    })
    expect(responseDianon.statusCode).toEqual(201)

    userId = JSON.parse(responseDianon.payload)?.id
    const response = await server.inject({
      method: 'POST',
      url: `/dianons/${userId}/features`,
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
    const tatoUpdate = 'test-tato-UPDATED'
    const responseDianon = await server.inject({
      method: 'POST',
      url: '/dianons',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        firstName: 'test-first-name',
        lastName: 'test-last-name',
        email: `test-${Date.now()}@prisma.io`
      }
    })
    expect(responseDianon.statusCode).toEqual(201)

    userId = JSON.parse(responseDianon.payload)?.id

    const responseFeat = await server.inject({
      method: 'POST',
      url: `/dianons/${userId}/features`,
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

    expect(responseFeat.statusCode).toEqual(201)
    userId = JSON.parse(responseFeat.payload)?.id
    expect(typeof userId === 'number').toBeTruthy()

    const response = await server.inject({
      method: 'PUT',
      url: `/dianons/features/${userId}`,
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

})