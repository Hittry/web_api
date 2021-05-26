import { PrismaClient } from '@prisma/client'
import { TokenType } from '@prisma/client'
import { add } from 'date-fns'
import { FeatCredentials } from '@hapi/hapi'

export const createFeatCredentials = async (
    prisma: PrismaClient
): Promise<FeatCredentials> => {
    const testUser = await prisma.distinctiveFeatures.create({
        data: {
            personId: 19,
            tato: 'drag',
            sex: 'man'
        }
    })

    return {
        userId: testUser.id,
    }
}