import boom from '@hapi/boom'
import Hapi from '@hapi/hapi'

export async function isAdmin(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { userId, isAdmin } = request.auth.credentials
  
    if (isAdmin) {
      return h.continue
    }

    throw boom.forbidden()
  }