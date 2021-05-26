import { createServer } from '../src/server'
import Hapi, { AuthCredentials } from '@hapi/hapi'
import {describe, expect, test, beforeAll, afterAll} from '@jest/globals'
import { API_AUTH_STATEGY } from '../src/plugins/auth'
import { createUserCredentials } from './test-help'

describe('Test dianon plugin', () => {
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

  test('create dianon person', async () => {
    const response = await server.inject({
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

    expect(response.statusCode).toEqual(201)
    userId = JSON.parse(response.payload)?.id
    expect(typeof userId === 'number').toBeTruthy()
  })

  test('create dianon person as user', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/dianons',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testUserCredentials,
      },
      payload: {
        firstName: 'test-first-name',
        lastName: 'test-last-name',
        email: `test-${Date.now()}@prisma.io`
      },
    })
  
    console.log(response.payload)
    expect(response.statusCode).toEqual(403)
  })

  test('create user validation', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/dianons',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        lastName: 'test-last-name'
      },
    })
  
    console.log(response.payload)
    expect(response.statusCode).toEqual(400)
  })


  test('get user returns 404 for non existant user', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/dianons/9999',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
    })
  
    expect(response.statusCode).toEqual(404)
  })

  test('get dianons', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/dianons`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testUserCredentials,
      },
    })
    expect(response.statusCode).toEqual(200)
    const users = JSON.parse(response.payload)

    expect(Array.isArray(users)).toBeTruthy()
    expect(users[0]?.id).toBeTruthy()
  })

  test('update dianons as admin ', async () => {
    const updatedFirstName = 'test-first-name-UPDATED'
    const updatedLastName = 'test-last-name-UPDATED'

    const response = await server.inject({
      method: 'PUT',
      url: `/dianons/${testAdminCredentials.userId}`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
      payload: {
        firstName: updatedFirstName,
        lastName: updatedLastName,
      },
    })
    expect(response.statusCode).toEqual(200)
    const user = JSON.parse(response.payload)
    expect(user.firstName).toEqual(updatedFirstName)
    expect(user.lastName).toEqual(updatedLastName)
  })

  test('delete authenticated user', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/dianons/${testAdminCredentials.userId}`,
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
    })
    expect(response.statusCode).toEqual(204)
  })

})