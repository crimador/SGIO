import { prismadb } from '@/lib/prisma';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { newUserNotify } from './new-user-notify';


export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  //adapter: PrismaAdapter(prismadb),
  session: {
    strategy: 'jwt',
  },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' },
      },

      async authorize(credentials) {
        // console.log(credentials, "credentials");
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prismadb.users.findFirst({
          where: {
            email: credentials.email,
          },
        });

        //clear white space from password
        const trimmedPassword = credentials.password.trim();

        if (!user || !user?.password) {
          throw new Error('Email or password is missing');
        }

        const isCorrectPassword = await bcrypt.compare(
          trimmedPassword,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error('Password is incorrect');
        }

        //console.log(user, "user");
        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user?.email) {
        // Update lastLoginAt only on actual sign-in, not on every session refresh
        await prismadb.users.updateMany({
          where: { email: user.email },
          data: { lastLoginAt: new Date() },
        });
      }
      return true;
    },

    //TODO: fix this any
    async session({ token, session }: any) {
      const user = await prismadb.users.findFirst({
        where: {
          email: token.email as string,
        },
      });

      if (!user) {
        try {
          const existingCount = await prismadb.users.count();
          const isFirstUser = existingCount === 0;

          const newUser = await prismadb.users.create({
            data: {
              email: token.email as string,
              name: token.name,
              avatar: token.picture,
              is_admin: isFirstUser,
              is_account_admin: isFirstUser,
              lastLoginAt: new Date(),
              userRole: isFirstUser ? 'DG' : 'COMMERCIAL',
              mustChangePassword: false,
              userStatus: isFirstUser
                ? 'ACTIVE'
                : process.env.NEXT_PUBLIC_APP_URL === 'https://demo.saashq.org'
                  ? 'ACTIVE'
                  : 'PENDING',
            },
          });

          await newUserNotify(newUser);

          session.user.id = newUser.id;
          session.user.name = newUser.name;
          session.user.email = newUser.email;
          session.user.avatar = newUser.avatar;
          session.user.image = newUser.avatar;
          session.user.isAdmin = isFirstUser;
          session.user.userLanguage = newUser.userLanguage;
          session.user.userStatus = newUser.userStatus;
          session.user.lastLoginAt = newUser.lastLoginAt;
          session.user.userRole = newUser.userRole;
          session.user.mustChangePassword = newUser.mustChangePassword;
          return session;
        } catch (error) {
          return console.log(error);
        }
      } else {
        // User already exists — populate session from DB, no lastLoginAt update here
        session.user.id = user.id;
        session.user.name = user.name;
        session.user.email = user.email;
        session.user.avatar = user.avatar;
        session.user.image = user.avatar;
        session.user.isAdmin = user.is_admin;
        session.user.userLanguage = user.userLanguage;
        session.user.userStatus = user.userStatus;
        session.user.lastLoginAt = user.lastLoginAt;
        session.user.userRole = user.userRole;
        session.user.mustChangePassword = user.mustChangePassword;
      }

      return session;
    },
  },
};
