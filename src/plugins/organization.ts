import boom from '@hapi/boom'
import Hapi from '@hapi/hapi'
import Joi from 'joi'
import { API_AUTH_STATEGY } from './auth'
import { isAdmin } from '../auth-help'


declare module '@hapi/hapi' {
    interface OrgCredentials {
        userId: number
    }
}

const orgPlugin = {
  name: 'app/org',
  dependencies: ['prisma'],
  register: async function(server: Hapi.Server) {
    server.route([
        {
          method: 'POST',
          path: '/dianons/{personId}/organization',
          handler: registerOrgHandler,
          options : {
              description: 'Post information about organization by id, only if you admin',
              notes: 'Return json with organization info',
              tags: ['api', 'org'],
              pre: [isAdmin],
              auth: {
                  mode: 'required',
                  strategy: API_AUTH_STATEGY,
                },
              validate: {
                  payload: createOrgValidator,
                  failAction: (request, h, err) => {
                    throw err
                  },
              }
          },
        },
        {
            method: 'GET',
            path: '/dianons/organization',
            handler: getAllOrgHandler,
            options: {
              description: 'Get information about all organization',
              notes: 'Return json with all organization info',
              tags: ['api', 'org']
            }
            
        },
        {
            method: 'GET',
            path: '/dianons/organization/{personId}',
            handler: getOrgHandler,
            options: {
              description: 'Get information about organization by id',
              notes: 'Return json with organization info',
              tags: ['api', 'org'],
              validate: {
                params: Joi.object({
                    personId: Joi.string().pattern(/^[0-9]+$/),
                }),
                failAction: (request, h, err) => {
                    throw err
                  },
              },
            },
          },
          {
            method: 'DELETE',
            path: '/dianons/organization/{personId}',
            handler: deleteOrgHandler,
            options: {
              description: 'Delete information about organization by id, only if you admin',
              notes: 'Return string about delete organization',
              tags: ['api', 'org'],
              pre: [isAdmin],
              auth: {
                  mode: 'required',
                  strategy: API_AUTH_STATEGY,
                },
              validate: {
                params: Joi.object({
                    personId: Joi.string().pattern(/^[0-9]+$/),
                }),
                failAction: (request, h, err) => {
                  throw err
                },
              },
            },
          },
          {
            method: 'PUT',
            path: '/dianons/organization/{personId}',
            handler: updateOrgHandler,
            options: {
              description: 'Update information about organization by id, only if you admin',
              notes: 'Return json with update organization info',
              tags: ['api', 'org'],
              pre: [isAdmin],
              auth: {
                  mode: 'required',
                  strategy: API_AUTH_STATEGY,
                },
              validate: {
                params: Joi.object({
                    personId: Joi.string().pattern(/^[0-9]+$/),
                }),
                payload: updateOrgValidator,
                failAction: (request, h, err) => {
                  throw err
                },
              },
            },
          },
      ])
  },
}

export default orgPlugin

interface OrgInput {
    name: string
    rank?: string
    date?: Date
    firstName?: string
    lastName?: string
  }

  const testInputValidator = Joi.object({
    name: Joi.string().alter({
      create: (schema) => schema.required(),
      update: (schema) => schema.optional(),
    }),
    rank: Joi.string().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
      }),
    date: Joi.date().alter({
      create: (schema) => schema.optional(),
      update: (schema) => schema.optional(),
    }),
    firstName: Joi.string().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
    }),
    lastName: Joi.string().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
    }),
  })
  
  const createOrgValidator = testInputValidator.tailor('create')
  const updateOrgValidator = testInputValidator.tailor('update')

async function getOrgHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const personId = parseInt(request.params.personId, 10)
  
    try {
      const org = await prisma.organization.findUnique({
        where: {
          id: personId,
        },
      })
      if (!org) {
        return h.response().code(404)
      } else {
        return h.response(org).code(200)
      }
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to get organization')
    }
  }

  async function getAllOrgHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
  
    try {
      const org = await prisma.organization.findMany({
      })
      return h.response(org).code(200)
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to get organizationes')
    }
  }

  async function registerOrgHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
    const payload = request.payload as OrgInput
    const personId = parseInt(request.params.personId, 10)
  
    try {
      const createdOrg = await prisma.organization.create({
        data: {
          name: payload.name,
          rank: payload.rank,
          date: payload.date,
          firstName: payload.firstName,
          lastName: payload.lastName,
          person: {
            connect: {
              id: personId,
            },
          },
        },
      })
      return h.response(createdOrg).code(201)
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to create organization')
    }
  }

  async function deleteOrgHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
    const personeId = parseInt(request.params.personId, 10)
  
    try {
      await prisma.organization.delete({
        where: {
          id: personeId,
        },
      })
      return h.response('Organization delete').code(204)
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to delete organization')
    }
  }

  async function updateOrgHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
    const personeId = parseInt(request.params.personId, 10)
    const payload = request.payload as  Partial<OrgInput>
  
    try {
      const updatedOrg = await prisma.organization.update({
        where: {
          id: personeId,
        },
        data: payload,
      })
      return h.response(updatedOrg).code(200)
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to update organization')
    }
  }