import { PrismaClient } from '@prisma/client'
import { TokenType } from '@prisma/client'
import { add } from 'date-fns'
import { InfoCredentials } from '@hapi/hapi'

export const createInfoCredentials = async (
    prisma: PrismaClient
): Promise<InfoCredentials> => {
    const testUser = await prisma.personalInfo.create({
        data: {
            personId: 20,
            telephone: '87787878'
        },
    })
    return {
        userId: testUser.id,
    }
}