import Hapi from '@hapi/hapi'
import statusPlugin from './plugins/status'
import prismaPlugin from './plugins/prisma'
import usersPlugin from './plugins/users'
import dianonPlugin from './plugins/dianon'
import orgPlugin from './plugins/organization'
import featuresPlugin from './plugins/features'
import infoPlugin from './plugins/info'
import emailPlugin from './plugins/email'
import authPlugin from './plugins/auth'
import hapiAuthJWT from 'hapi-auth-jwt2'
import * as HapiSwagger from 'hapi-swagger'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'

const server: Hapi.Server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
  })

const swaggerOptions: HapiSwagger.RegisterOptions = {
      info: {
      title: 'Rest API Documentation',
    },
  }
  
export async function createServer(): Promise<Hapi.Server> {
  await server.register([
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ])
  await server.register([hapiAuthJWT, statusPlugin, prismaPlugin, authPlugin, usersPlugin, dianonPlugin, orgPlugin,
     featuresPlugin, infoPlugin, emailPlugin, Inert, Vision])
  await server.initialize()
  
 return server
}
  
export async function startServer(server: Hapi.Server): Promise<Hapi.Server> {
  await server.start()
  console.log(`Server running on ${server.info.uri}`)
  return server
}
  
process.on('unhandledRejection', err => {
  console.log(err)
  process.exit(1)
})

  //export async function start(): Promise<Hapi.Server> {
    //await server.register([
      //{
        //plugin: HapiSwagger,
        //options: swaggerOptions,
      //},
    //])
    //await server.register([hapiAuthJWT, authPlugin, prismaPlugin, emailPlugin, statusPlugin, usersPlugin, dianonPlugin, 
      //orgPlugin, featuresPlugin, infoPlugin, Inert, Vision])

//    await server.start()
  //  console.log(`Server running on ${server.info.uri}`)
    //return server
  //}
  
  //process.on('unhandledRejection', (err) => {
    //console.log(err)
    //process.exit(1)
  //})
  
  
  //start()
    //.catch((err) => {
      //console.log(err)
    //})