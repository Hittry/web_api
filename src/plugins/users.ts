import boom from '@hapi/boom'
import Hapi from '@hapi/hapi'
import Joi from 'joi'
import { API_AUTH_STATEGY } from './auth'
import { isAdmin } from '../auth-help'

// plugin to instantiate Prisma Client
const usersPlugin = {
  name: 'app/users',
  dependencies: ['prisma'],
  register: async function(server: Hapi.Server) {
    server.route([
        {
          method: 'POST',
          path: '/users',
          handler: registerHandler,
          options : {
              description: 'Post user, only if you admin ',
              notes: 'Return json with user info',
              tags: ['api', 'user'],
              pre: [isAdmin],
              auth: {
                  mode: 'required',
                  strategy: API_AUTH_STATEGY,
                },
              validate: {
                  payload: createUserValidator,
                  failAction: (request, h, err) => {
                    // show validation errors to user https://github.com/hapijs/hapi/issues/3706
                    throw err
                  },
              }
          },
        },
        {
            method: 'GET',
            path: '/users/{userId}',
            handler: getUserHandler,
            options: {
              description: 'Get user by id only if you admin',
              notes: 'Return json with user info',
              tags: ['api', 'user'],
              pre: [isAdmin],
              auth: {
                  mode: 'required',
                  strategy: API_AUTH_STATEGY,
                },
              validate: {
                params: Joi.object({
                  userId: Joi.string().pattern(/^[0-9]+$/),
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
            path: '/users/{userId}',
            handler: deleteHandler,
            options: {
              description: 'Delete user by id, only if you admin ',
              notes: 'Return string about delete',
              tags: ['api', 'user'],
              pre: [isAdmin],
              auth: {
                  mode: 'required',
                  strategy: API_AUTH_STATEGY,
                },
              validate: {
                params: Joi.object({
                  userId: Joi.string().pattern(/^[0-9]+$/),
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
            path: '/users/{userId}',
            handler: updateHandler,
            options: {
              description: 'Update user by id, only if you admin ',
              notes: 'Return json with update user info',
              tags: ['api', 'user'],
              pre: [isAdmin],
              auth: {
                  mode: 'required',
                  strategy: API_AUTH_STATEGY,
                },
              validate: {
                params: Joi.object({
                  userId: Joi.string().pattern(/^[0-9]+$/),
                }),
                payload: updateUserValidator,
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

export default usersPlugin

const userInputValidator = Joi.object({
    email: Joi.string()
      .email()
      .alter({
        create: schema => schema.required(),
        update: schema => schema.optional(),
      }),
    firstName: Joi.string().alter({
      create: schema => schema.required(),
      update: schema => schema.optional(),
    }),
    lastName: Joi.string().alter({
      create: schema => schema.required(),
      update: schema => schema.optional(),
    })
    })
    const createUserValidator = userInputValidator.tailor('create')
    const updateUserValidator = userInputValidator.tailor('update')

interface UserInput {
        email: string
        firstName?: string
        lastName?: string
};

async function getUserHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const userId = parseInt(request.params.userId, 10)
      
    try {
        const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        })
        if (!user) {
            return boom.notFound('User not found')
          } else {
            return h.response(user).code(200)
          }
        } catch (err) {
          console.log(err)
          return h.response().code(500)
        }
}

async function registerHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const payload = request.payload as UserInput
      
    try {
        const createdUser = await prisma.user.create({
        data: {
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName
        },
        select: {
            id: true,
        },
    })
    return h.response(createdUser).code(201)
    } catch (err) {
        console.log(err)
        return boom.notImplemented('Error creating user')
    }
}

async function deleteHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const userId = request.params.userId as string
  
    try {
      await prisma.user.delete({
        where: {
          id: parseInt(userId, 10),
        },
      })
      return h.response('User delete').code(204)
    } catch (err) {
      console.log(err)
      return boom.notImplemented('Error delete user')
    }
  }

  async function updateHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app
    const userId = request.params.userId as string
    const payload = request.payload as UserInput
  
    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: parseInt(userId, 10),
        },
        data: payload,
      })
      return h.response(updatedUser).code(200)
    } catch (err) {
      console.log(err)
      return h.response().code(500)
    }
  }
