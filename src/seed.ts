import { PrismaClient } from '@prisma/client'
import { add } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  const testUser = await prisma.user.upsert({
    create: {
      email: 'test@prisma.io',
      firstName: 'Grace',
      lastName: 'Bell',
    },
    update: {
      firstName: 'Grace',
      lastName: 'Bell',
    },
    where: {
      email: 'test@prisma.io',
    },
  })
  const testAdmin = await prisma.user.upsert({
    create: {
      email: 'test-admin@prisma.io',
      firstName: 'Raini',
      lastName: 'Goenka',
      isAdmin: true,
    },
    update: {
      firstName: 'Raini',
      lastName: 'Goenka',
      isAdmin: true,
    },
    where: {
      email: 'test-admin@prisma.io',
    },
  })

  console.log(
    `Created test user\tid: ${testUser.id} | email: ${testUser.email} `,
  )
  console.log(
    `Created test admin\tid: ${testAdmin.id} | email: ${testAdmin.email} `,
  )
}

main()
  .catch((e: Error) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // Disconnect Prisma Client
    await prisma.$disconnect()
  })