import { PrismaClient } from '@prisma/client';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        userId: { label: 'UserId', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.userId || !credentials?.password) return null;

          const user = await prisma.user.findUnique({
            where: { userId: Number(credentials.userId) }
          });

          if (!user) return null;

          // const isValid = await compare(credentials.password, user.password);
          const isValid = credentials.password == user.password;
          if (!isValid) return null;

          return { id: user.id.toString(), userId: user.userId };
        } catch {
          return null;
        }
      }
    })
  ],
  logger: {
    error(code, metadata) {
      console.error('NextAuth error:', code, metadata);
    }
  },
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userId = user.userId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.userId = token.userId;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};

