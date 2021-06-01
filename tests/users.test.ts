import { createServer } from '../src/server'
// @ts-ignore
import Hapi, { AuthCredentials }  from '@hapi/hapi'
import {describe, expect, test, beforeAll, afterAll} from '@jest/globals'
import { API_AUTH_STATEGY } from '../src/plugins/auth'
import { createUserCredentials } from './test-help'

describe('Test users plugin', () => {
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

  test('create user as admin', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/users',
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
    console.log(response.payload)
    userId = JSON.parse(response.payload)?.id
    expect(typeof userId === 'number').toBeTruthy()
  })

  test('create user as user', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/users',
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
      url: '/users',
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
      url: '/users/9999',
      auth: {
        strategy: API_AUTH_STATEGY,
        credentials: testAdminCredentials,
      },
    })
  
    expect(response.statusCode).toEqual(404)
  })

  test('update user ', async () => {
    const updatedFirstName = 'test-first-name-UPDATED'
    const updatedLastName = 'test-last-name-UPDATED'

    const response = await server.inject({
      method: 'PUT',
      url: `/users/${testAdminCredentials.userId}`,
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
    console.log(user)
    expect(user.firstName).toEqual(updatedFirstName)
    expect(user.lastName).toEqual(updatedLastName)
  })

})