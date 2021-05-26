import { PrismaClient } from '@prisma/client'
import { TokenType } from '@prisma/client'
import { add } from 'date-fns'
import { DianonCredentials } from '@hapi/hapi'

export const createDianonCredentials = async (
    prisma: PrismaClient
): Promise<DianonCredentials> => {
    const testUser = await prisma.dianonPerson.create({
        data: {
            'firstName': 'hhhh',
            'lastName': 'sxnjsnjsnjx',
            email: `test-${Date.now()}@test.com`
        },
    })

    return {
        userId: testUser.id,
    }
}