import boom from '@hapi/boom'
import Hapi from '@hapi/hapi'
import Joi from 'joi'
import { API_AUTH_STATEGY } from './auth'
import { isAdmin } from '../auth-help'

// plugin to instantiate Prisma Client
const featuresPlugin = {
  name: 'app/features',
  dependencies: ['prisma'],
  register: async function(server: Hapi.Server) {
    server.route([
        {
          method: 'POST',
          path: '/dianons/{personId}/features',
          handler: registerFeaturesHandler,
          options : {
              description: 'Post features abot dianon person, only if you admin',
              notes: 'Return json with features info',
              tags: ['api', 'feat'],
              pre: [isAdmin],
              auth: {
                  mode: 'required',
                  strategy: API_AUTH_STATEGY,
                },
              validate: {
                  payload: createFeaturesValidator,
                  failAction: (request, h, err) => {
                    // show validation errors to user https://github.com/hapijs/hapi/issues/3706
                    throw err
                  },
              }
          },
        },
        {
            method: 'GET',
            path: '/dianons/features',
            handler: getAllFeaturesHandler,
            options: {
              description: 'Get all features in datebase',
              notes: 'Return json with features info',
              tags: ['api', 'feat'],
            }
            
        },
        {
            method: 'GET',
            path: '/dianons/features/{personId}',
            handler: getFeaturesHandler,
            options: {
              description: 'Get features abot dianon person by id',
              notes: 'Return json with features info about one person',
              tags: ['api', 'feat'],
              validate: {
                params: Joi.object({
                    personId: Joi.string().pattern(/^[0-9]+$/),
                }),
                failAction: (request, h, err) => {
                    // show validation errors to user https://github.com/hapijs/hapi/issues/3706
                    throw err
                  },
              },
            },
          },
          {
            method: 'DELETE',
            path: '/dianons/features/{personId}',
            handler: deleteFeaturesHandler,
            options: {
              description: 'Delete features abot dianon person, only if you admin',
              notes: 'Return string about delete',
              tags: ['api', 'feat'],
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
                  // show validation errors to user https://github.com/hapijs/hapi/issues/3706
                  throw err
                },
              },
            },
          },
          {
            method: 'PUT',
            path: '/dianons/features/{personId}',
            handler: updateFeaturesHandler,
            options: {
              description: 'Update features abot dianon person, only if you admin',
              notes: 'Return json with updated features info',
              tags: ['api', 'feat'],
              pre: [isAdmin],
              auth: {
                  mode: 'required',
                  strategy: API_AUTH_STATEGY,
                },
              validate: {
                params: Joi.object({
                    personId: Joi.string().pattern(/^[0-9]+$/),
                }),
                payload: updateFeaturesValidator,
                failAction: (request, h, err) => {
                  // show validation errors to user https://github.com/hapijs/hapi/issues/3706
                  throw err
                },
              },
            },
          },
      ])
  },
}

export default featuresPlugin

interface FeaturesInput {
    tato?: string
    colour?: string
    sex: string
    injury?: string
  }

  const featuresInputValidator = Joi.object({
    tato: Joi.string().alter({
      create: (schema) => schema.optional(),
      update: (schema) => schema.optional(),
    }),
    colour: Joi.string().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
      }),
    sex: Joi.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    injury: Joi.string().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
    }),
  })
  
  const createFeaturesValidator = featuresInputValidator.tailor('create')
  const updateFeaturesValidator = featuresInputValidator.tailor('update')

async function getFeaturesHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const personId = parseInt(request.params.personId, 10)
  
    try {
      const features = await prisma.distinctiveFeatures.findUnique({
        where: {
          id: personId,
        },
      })
      if (!features) {
        return h.response().code(404)
      } else {
        return h.response(features).code(200)
      }
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to get features')
    }
  }

  async function getAllFeaturesHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
  
    try {
      const features = await prisma.distinctiveFeatures.findMany({
      })
      return h.response(features).code(200)
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to get features')
    }
  }

  async function registerFeaturesHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
    const payload = request.payload as FeaturesInput
    const personId = parseInt(request.params.personId, 10)
  
    try {
      const createdFeatures = await prisma.distinctiveFeatures.create({
        data: {
            person: {
                connect: {
                  id: personId,
                },
              },
            tato: payload.tato,
            colour: payload.colour,
            sex: payload.sex,
            injury: payload.injury
        },
      })
      return h.response(createdFeatures).code(201)
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to create organization')
    }
  }

  async function deleteFeaturesHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
    const personeId = parseInt(request.params.personId, 10)
  
    try {
      await prisma.distinctiveFeatures.delete({
        where: {
          id: personeId,
        },
      })
      return h.response('features delete').code(204)
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to delete features')
    }
  }

  async function updateFeaturesHandler(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit,
  ) {
    const { prisma } = request.server.app
    const personeId = parseInt(request.params.personId, 10)
    const payload = request.payload as  Partial<FeaturesInput>
  
    try {
      const updatedFeatures = await prisma.distinctiveFeatures.update({
        where: {
          id: personeId,
        },
        data: payload,
      })
      return h.response(updatedFeatures).code(200)
    } catch (err) {
      request.log('error', err)
      return boom.badImplementation('failed to update features')
    }
  }