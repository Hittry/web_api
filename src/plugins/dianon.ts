import boom from '@hapi/boom'
import Hapi from '@hapi/hapi'
import Joi from 'joi'
import { API_AUTH_STATEGY } from './auth'
import { isAdmin } from '../auth-help'

declare module '@hapi/hapi' {
    interface DianonCredentials {
        userId: number
    }
}

const dianonPlugin = {
  name: 'app/dianons',
  dependencies: ['prisma'],
  register: async function(server: Hapi.Server) {
    server.route([
        {
          method: 'POST',
          path: '/dianons',
          handler: registerDianonHandler,
          options : {
              description: 'Post dianon person, only if you admin ',
              notes: 'Return json with person info',
              tags: ['api', 'dianon'],
              pre: [isAdmin],
                auth: {
                    mode: 'required',
                    strategy: API_AUTH_STATEGY,
                  },
              validate: {
                  payload: createDianonValidator,
                  failAction: (request, h, err) => {
                    throw err
                  },
              }
          },
        },
        {
            method: 'GET',
            path: '/dianons',
            handler: getAllDianonHandler,
            options: {
              description: 'Get all dianon person',
              notes: 'Return json with all persons info',
              tags: ['api', 'dianon'],
            }
        },
        {
            method: 'GET',
            path: '/dianons/{personId}',
            handler: getDianonHandler,
            options: {
              description: 'Get dianon person by id',
              notes: 'Return json with person info',
              tags: ['api', 'dianon'],
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
            path: '/dianons/{personId}',
            handler: deleteDianonHandler,
            options: {
              description: 'Delete dianon person by id, only if you admin',
              notes: 'Return string about delete',
              tags: ['api', 'dianon'],
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
            path: '/dianons/{personId}',
            handler: updateDianonHandler,
            options: {
              description: 'Update dianon person, only if you admin',
              notes: 'Return json with update person info',
              tags: ['api', 'dianon'],
              pre: [isAdmin],
              auth: {
                  mode: 'required',
                  strategy: API_AUTH_STATEGY,
                },
              validate: {
                params: Joi.object({
                    personId: Joi.string().pattern(/^[0-9]+$/),
                }),
                payload: updateDianonValidator,
                failAction: (request, h, err) => {
                  throw err
                },
              },
            },
          },
      ])
  },
}

export default dianonPlugin

const userInputValidator = Joi.object({
    email: Joi.string()
    .email()
    .alter({
      create: schema => schema.optional(),
      update: schema => schema.optional(),
    }),
    firstName: Joi.string().alter({
      create: schema => schema.required(),
      update: schema => schema.optional(),
    }),
    lastName: Joi.string().alter({
      create: schema => schema.required(),
      update: schema => schema.optional(),
    }),
    social: Joi.object({
      facebook: Joi.string().optional(),
      twitter: Joi.string().optional(),
      vk: Joi.string().optional(),
      website: Joi.string().optional(),
    }).optional(),
  })
  
  const createDianonValidator = userInputValidator.tailor('create')
  const updateDianonValidator = userInputValidator.tailor('update')

interface DianonInput {
    email?: string
    firstName: string
    lastName: string
    social: {
      facebook?: string
      twitter?: string
      vk?: string
      website?: string
    }
}

async function getDianonHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
    const personId = parseInt(request.params.personId, 10)
  
    try {
      const dianon = await prisma.dianonPerson.findUnique({
        where: {
          id: personId,
        }
      })
      if (!dianon) {
        return h.response().code(404)
      } else {
        return h.response(dianon).code(200)
      }
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to get dianon person')
    }
  }

  async function deleteDianonHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
    const personId = parseInt(request.params.personId, 10)
  
    try {
        await prisma.dianonPerson.delete({
          where: {
            id: personId,
          },
        })
        return h.response('Dianon person delete').code(204)
      } catch (err) {
        console.log(err)
        return boom.notImplemented('Error delete user')
      }
  }

  async function updateDianonHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const userId = request.params.personId as string
    const payload = request.payload as DianonInput
  
    try {
      const updatedDianon = await prisma.dianonPerson.update({
        where: {
          id: parseInt(userId, 10),
        },
        data: payload,
      })
      return h.response(updatedDianon).code(200)
    } catch (err) {
      console.log(err)
      return h.response().code(500)
    }
  }

  async function getAllDianonHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
  
    try {
      const dianon_person = await prisma.dianonPerson.findMany({
      })
      return h.response(dianon_person).code(200)
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to get dianon persones')
    }
  }

  async function registerDianonHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
    const payload = request.payload as DianonInput
      
    try {
        const createdDianon = await prisma.dianonPerson.create({
        data: {
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            social: JSON.stringify(payload.social),
        },
        select: {
            id: true,
        },
    })
    return h.response(createdDianon).code(201)
    } catch (err) {
        console.log(err)
        return boom.notImplemented('Error creating user')
    }
  }