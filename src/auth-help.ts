import boom from '@hapi/boom'
import Hapi from '@hapi/hapi'

// Pre-function to check if the authenticated user matches the requested user
export async function isAdmin(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    // 👇 userId and isAdmin are populated by the `validateAPIToken` function
    const { userId, isAdmin } = request.auth.credentials
  
    if (isAdmin) {
      // If the user is an admin allow
      return h.continue
    }
  
    // The authenticated user is not authorized
    throw boom.forbidden()
  }