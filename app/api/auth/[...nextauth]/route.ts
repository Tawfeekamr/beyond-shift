import { compare } from 'bcrypt'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import {prismadb} from "@/lib/prismadb";
export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    debug: true,
    providers: [
        CredentialsProvider({
            name: 'Sign in',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'hello@example.com'
                },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null
                }

                const user = await prismadb.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })

                if (!user) {
                    return null
                }

                const isPasswordValid = await compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id + '',
                    email: user.email,
                }
            }
        })
    ],

    callbacks: {
        session: async ({ session, token }) => {
            await prismadb.user.update({
                where: {
                    email: session?.user?.email || undefined
                },
                data: {
                    last_login: new Date()
                }
            })

            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                }
            }
        },
        jwt: ({ token, user }) => {
            if (user) {
                const u = user as unknown as any
                return {
                    ...token,
                    id: u.id,
                    secret: process.env.NEXTAUTH_SECRET
                }
            }
            return token
        }
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }