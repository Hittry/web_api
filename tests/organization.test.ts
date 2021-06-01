import { createServer } from '../src/server'
// @ts-ignore
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

  test('create dianon organization as admin', async () => {
    const responseDianon = await server.inject({
      method: 'POST',
      url: '/dianons',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        firstName: 'test-info-name',
        lastName: 'info-last-name',
        email: `test-${Date.now()}@prisma.io`
      }
    })
    expect(responseDianon.statusCode).toEqual(201)

    userId = JSON.parse(responseDianon.payload)?.id

    const response = await server.inject({
      method: 'POST',
      url: `/dianons/${userId}/organization`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        name: 'MEPHI',
        rank: 'gen dir'
      }
    })

    expect(response.statusCode).toEqual(201)
    userId = JSON.parse(response.payload)?.id
    expect(typeof userId === 'number').toBeTruthy()
  })

  test('get all dianons organization', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/dianons/organization',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testUserCredentials,
      },
    })
  
    console.log(response.payload)
    expect(response.statusCode).toEqual(200)
  })

  test('create dianon organization validation', async () => {
    const responseDianon = await server.inject({
      method: 'POST',
      url: '/dianons',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        firstName: 'test-info-name',
        lastName: 'info-last-name',
        email: `test-${Date.now()}@prisma.io`
      }
    })
    expect(responseDianon.statusCode).toEqual(201)

    userId = JSON.parse(responseDianon.payload)?.id
    const response = await server.inject({
      method: 'POST',
      url: `/dianons/${userId}/organization`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        rank: 'gen dir'
      },
    })
  
    console.log(response.payload)
    expect(response.statusCode).toEqual(400)
  })

  test('update dianon organization info', async () => {
    const nameUpdated = 'name-UPDATED'
    const responseDianon = await server.inject({
      method: 'POST',
      url: '/dianons',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        firstName: 'test-info-name',
        lastName: 'info-last-name',
        email: `test-${Date.now()}@prisma.io`
      }
    })
    expect(responseDianon.statusCode).toEqual(201)

    userId = JSON.parse(responseDianon.payload)?.id

    const responseOrg = await server.inject({
      method: 'POST',
      url: `/dianons/${userId}/organization`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        name: 'MEPHI',
        rank: 'gen dir'
      }
    })

    expect(responseOrg.statusCode).toEqual(201)
    userId = JSON.parse(responseOrg.payload)?.id
    expect(typeof userId === 'number').toBeTruthy()

    const response = await server.inject({
      method: 'PUT',
      url: `/dianons/organization/${userId}`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        name: nameUpdated
      },
    })
    expect(response.statusCode).toEqual(200)
    const user = JSON.parse(response.payload)
    expect(user.name).toEqual(nameUpdated)
  })

})