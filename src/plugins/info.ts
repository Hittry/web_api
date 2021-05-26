import boom from '@hapi/boom'
import Hapi from '@hapi/hapi'
import Joi from 'joi'
import { API_AUTH_STATEGY } from './auth'
import { isAdmin } from '../auth-help'


declare module '@hapi/hapi' {
    interface InfoCredentials {
        userId: number
    }
}

const infoPlugin = {
  name: 'app/info',
  dependencies: ['prisma'],
  register: async function(server: Hapi.Server) {
    server.route([
        {
          method: 'POST',
          path: '/dianons/{personId}/info',
          handler: registerInfoHandler,
          options : {
              description: 'Post personal info about dianon person, only if you admin',
              notes: 'Return json with personal info',
              tags: ['api', 'info'],
              pre: [isAdmin],
              auth: {
                  mode: 'required',
                  strategy: API_AUTH_STATEGY,
                },
              validate: {
                  payload: createInfoValidator,
                  failAction: (request, h, err) => {
                    throw err
                  },
              }
          },
        },
        {
            method: 'GET',
            path: '/dianons/info',
            handler: getAllInfoHandler,
            options: {
              description: 'Get personal info abot dianon persons',
              notes: 'Return json with personals info',
              tags: ['api', 'info']
            }
            
        },
        {
            method: 'GET',
            path: '/dianons/info/{personId}',
            handler: getInfoHandler,
            options: {
              description: 'Get personal info abot dianon person by id',
              notes: 'Return json with personal info',
              tags: ['api', 'info'],
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
            path: '/dianons/info/{personId}',
            handler: deleteInfoHandler,
            options: {
              description: 'Delete personal info abot dianon person by id, only if you admin',
              notes: 'Return string about delete',
              tags: ['api', 'info'],
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
            path: '/dianons/info/{personId}',
            handler: updateInfoHandler,
            options: {
              description: 'Update personal info abot dianon person by id, only if you admin',
              notes: 'Return json with updated personal info',
              tags: ['api', 'info'],
              pre: [isAdmin],
              auth: {
                  mode: 'required',
                  strategy: API_AUTH_STATEGY,
                },
              validate: {
                params: Joi.object({
                    personId: Joi.string().pattern(/^[0-9]+$/),
                }),
                payload: updateInfoValidator,
                failAction: (request, h, err) => {
                  throw err
                },
              },
            },
          },
      ])
  },
}

export default infoPlugin

interface InfoInput {
    passport?: string
    marital?: string
    children?: string
    adress?: string
    register?: string
    telephone: string
  }

  const infoInputValidator = Joi.object({
    passport: Joi.string().alter({
      create: (schema) => schema.optional(),
      update: (schema) => schema.optional(),
    }),
    marital: Joi.string().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
      }),
    children: Joi.string().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
    }),
    adress: Joi.string().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
    }),
    register: Joi.string().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
    }),
    telephone: Joi.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    })
  })
  
  const createInfoValidator = infoInputValidator.tailor('create')
  const updateInfoValidator = infoInputValidator.tailor('update')

async function getInfoHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const personId = parseInt(request.params.personId, 10)
  
    try {
      const info = await prisma.personalInfo.findUnique({
        where: {
          id: personId,
        },
      })
      if (!info) {
        return h.response().code(404)
      } else {
        return h.response(info).code(200)
      }
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to get personal info')
    }
  }

  async function getAllInfoHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
  
    try {
      const info = await prisma.personalInfo.findMany({
      })
      return h.response(info).code(200)
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to get personal info')
    }
  }

  async function registerInfoHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
    const payload = request.payload as InfoInput
    const personId = parseInt(request.params.personId, 10)
  
    try {
      const createdInfo = await prisma.personalInfo.create({
        data: {
            person: {
                connect: {
                  id: personId,
                },
              },
            passport: payload.passport,
            marital: payload.marital,
            children: payload.children,
            adress: payload.adress,
            register: payload.register,
            telephone: payload.telephone,
        },
      })
      return h.response(createdInfo).code(201)
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to create personal info')
    }
  }

  async function deleteInfoHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
    const personeId = parseInt(request.params.personId, 10)
  
    try {
      await prisma.personalInfo.delete({
        where: {
          id: personeId,
        },
      })
      return h.response('personal info delete').code(204)
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to delete features')
    }
  }

  async function updateInfoHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
    const personeId = parseInt(request.params.personId, 10)
    const payload = request.payload as  Partial<InfoInput>
  
    try {
      const updatedInfo = await prisma.personalInfo.update({
        where: {
          id: personeId,
        },
        data: payload,
      })
      return h.response(updatedInfo).code(200)
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to update features')
    }
  }