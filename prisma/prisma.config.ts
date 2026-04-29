import { PrismaConfig } from '@prisma/client'

const config: PrismaConfig = {
  schema: './schema.prisma',
  datasourceUrl: process.env.DATABASE_URL,
}

export default config
