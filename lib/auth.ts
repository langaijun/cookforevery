import NextAuth, { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'
import { Provider } from '@prisma/client'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      avatar?: string | null
      isAdmin?: boolean
    } & DefaultSession['user']
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email || !account) {
        return false
      }

      // 检查用户是否存在
      let dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      // 创建新用户
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || user.email.split('@')[0],
            avatar: user.image || null,
            provider: account.provider === 'github' ? Provider.GITHUB : Provider.GOOGLE,
            providerId: account.providerAccountId,
          },
        })
      }

      return true
    },

    async session({ session, token }) {
      if (session.user?.email) {
        // 获取完整用户信息
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        })

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.name = dbUser.name
          session.user.email = dbUser.email
          session.user.image = dbUser.avatar
          session.user.isAdmin = dbUser.isAdmin
        }
      }
      return session
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)
