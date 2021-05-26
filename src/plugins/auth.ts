import boom from '@hapi/boom'
import Hapi from '@hapi/hapi'
import Joi from 'joi'
import jwt from 'jsonwebtoken'
import { TokenType, User } from '@prisma/client'
import { add } from 'date-fns'

declare module '@hapi/hapi' {
  interface AuthCredentials {
    userId: number
    tokenId: number
    isAdmin: boolean
  }
}

const authPlugin: Hapi.Plugin<null> = {
  name: 'app/auth',
  dependencies: ['prisma', 'hapi-auth-jwt2', 'app/email'],
  register: async function(server: Hapi.Server) {

    server.auth.strategy(API_AUTH_STATEGY, 'jwt', {
      key: JWT_SECRET,
      verifyOptions: { algorithms: [JWT_ALGORITHM] },
      validate: validateAPIToken,
    })
    
    server.auth.default(API_AUTH_STATEGY)

    server.route([
        {
          method: 'POST',
          path: '/login',
          handler: loginHandler,
          options: {
            description: 'Post email where send short token',
            notes: 'Returns code 200 if email send correct',
            tags: ['api', 'auth'],
            auth: false,
            validate: {
              payload: Joi.object({
                email: Joi.string().email().required(),
              }),
            },
          },
        },
        {
          method: 'POST',
          path: '/authenticate',
          handler: authenticateHandler,
          options: {
            description: 'Post email and token from message',
            notes: 'Return header with jwt token',
            tags: ['api', 'auth'],
            auth: false,
            validate: {
              payload: Joi.object({
                email: Joi.string().email().required(),
                emailToken: Joi.string().required(),
              }),
            },
          },
        }
      ])
  },
}

export default authPlugin

export const API_AUTH_STATEGY = 'API'

const apiTokenSchema = Joi.object({
  tokenId: Joi.number().integer().required(),
})

interface APITokenPayload {
  tokenId: number
}

const validateAPIToken = async (
  decoded: APITokenPayload,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) => {
  const { prisma } = request.server.app
  const { tokenId } = decoded

  const { error } = apiTokenSchema.validate(decoded)

  if (error) {
    request.log(['error', 'auth'], `API token error: ${error.message}`)
    return { isValid: false }
  }

  try {
    // Fetch the token from DB to verify it's valid
    const fetchedToken = await prisma.token.findUnique({
      where: {
        id: tokenId,
      },
      include: {
        user: true,
      },
    })

    if (!fetchedToken || !fetchedToken?.valid) {
      return { isValid: false, errorMessage: 'Invalid Token' }
    }

    if (fetchedToken.expiration < new Date()) {
      return { isValid: false, errorMessage: 'Token expired' }
    }

    return {
      isValid: true,
      credentials: {
        tokenId: decoded.tokenId,
        userId: fetchedToken.userId,
        isAdmin: fetchedToken.user.isAdmin
      },
    }
  } catch (error) {
    request.log(['error', 'auth', 'db'], error)
    return { isValid: false }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_JWT_SECRET'

const JWT_ALGORITHM = 'HS256'

const AUTHENTICATION_TOKEN_EXPIRATION_HOURS = 12

interface AuthenticateInput {
  email: string
  emailToken: string
}

async function authenticateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {

  const { prisma } = request.server.app

  const { email, emailToken } = request.payload as AuthenticateInput

  try {

    const fetchedEmailToken = await prisma.token.findUnique({
      where: {
        emailToken: emailToken,
      },
      include: {
        user: true,
      },
    })

    if (!fetchedEmailToken?.valid) {
      return boom.unauthorized()
    }

    if (fetchedEmailToken.expiration < new Date()) {
      return boom.unauthorized('Token expired')
    }

    if (fetchedEmailToken?.user?.email === email) {
      const tokenExpiration = add(new Date(), {
        hours: AUTHENTICATION_TOKEN_EXPIRATION_HOURS,
      })
      const createdToken = await prisma.token.create({
        data: {
          type_token: TokenType.API,
          expiration: tokenExpiration,
          user: {
            connect: {
              email,
            },
          },
        },
      })

      await prisma.token.update({
        where: {
          id: fetchedEmailToken.id,
        },
        data: {
          valid: false,
        },
      })

      const authToken = generateAuthToken(createdToken.id)
      return h.response().code(200).header('Authorization', authToken)
    } else {
      return boom.unauthorized()
    }
  } catch (error) {
    return boom.badImplementation(error.message)
  }
}

function generateAuthToken(tokenId: number): string {
  const jwtPayload = { tokenId }

  return jwt.sign(jwtPayload, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    noTimestamp: true,
  })
}

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10

interface LoginInput {
  email: string
}

async function loginHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma, sendEmailToken } = request.server.app

  const { email } = request.payload as LoginInput

  const emailToken = generateEmailToken()

  const tokenExpiration = add(new Date(), {
    minutes: EMAIL_TOKEN_EXPIRATION_MINUTES,
  })
  try {
    const createdToken = await prisma.token.create({
      data: {
        emailToken,
        type_token: TokenType.EMAIL,
        expiration: tokenExpiration,
        user: {
          connectOrCreate: {
            where: {
                email,
              },
            create: {
              email,
            },
          },
        },
      },
    })

    await sendEmailToken(email, emailToken)
    return h.response().code(200)
  } catch (error) {
    return boom.badImplementation(error.message)
  }
}

function generateEmailToken(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString()
}