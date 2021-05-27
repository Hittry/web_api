import Hapi from '@hapi/hapi'
import Joi from 'joi'
import Boom from '@hapi/boom'
import sendgrid from '@sendgrid/mail'

declare module '@hapi/hapi' {
  interface ServerApplicationState {
    sendEmailToken(email: string, token: string): Promise<void>
  }
}

const emailPlugin = {
  name: 'app/email',
  register: async function(server: Hapi.Server) {
    console.log(process.env.SENDGRID_API_KEY)
    if (!process.env.SENDGRID_API_KEY) {
      console.log(
        `The SENDGRID_API_KEY env var must be set, otherwise the API won't be able to send emails.`,
        `Using debug mode which logs the email tokens instead.`,
      )
      server.app.sendEmailToken = debugSendEmailToken
    } else {
      sendgrid.setApiKey(process.env.SENDGRID_API_KEY)
      server.app.sendEmailToken = sendEmailToken
    }
  },
}

export default emailPlugin

async function sendEmailToken(email: string, token: string) {
  console.log(email)
  console.log(token)
  const msg = {
    to: email,
    from: 'mr.sasha.shuv@gmail.com',
    subject: 'Login token for the modern backend API',
    text: `The login token for the API is: ${token}`,
  }
  console.log(msg)
  await sendgrid.send(msg)
}

async function debugSendEmailToken(email: string, token: string) {
  console.log(`email token for ${email}: ${token} `)
}