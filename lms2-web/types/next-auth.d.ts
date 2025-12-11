// /types/next-auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      userId: number;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    userId: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    userId: number;
  }
}
