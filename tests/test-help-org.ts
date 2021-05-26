import { PrismaClient } from '@prisma/client'
import { TokenType } from '@prisma/client'
import { add } from 'date-fns'
import { OrgCredentials } from '@hapi/hapi'

export const createOrgCredentials = async (
    prisma: PrismaClient
): Promise<OrgCredentials> => {
    const testUser = await prisma.organization.create({
        data: {
            personID: 20,
            name: 'company-name'
        },
    })

    return {
        userId: testUser.id,
    }
}