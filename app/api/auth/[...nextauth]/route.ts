import { compare } from 'bcrypt'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import {prismadb} from "@/lib/prismadb";
import {NextResponse} from "next/server";
import {SIGN_IN_ERROR} from "@/utils/statics";
export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
     signIn: "/",
     error: "/"
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
            //@ts-ignore
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return new NextResponse(SIGN_IN_ERROR).json()
                }

                const user = await prismadb.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })
                console.log("user",user)

                if (!user) {
                    return new NextResponse(SIGN_IN_ERROR).json()
                }

                const isPasswordValid = await compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    return new NextResponse(SIGN_IN_ERROR).json()
                }

                return {
                    id: user.id + '',
                    email: user.email,
                }
            }
        })
    ],

    callbacks: {
        session: async ({ session, token }): Promise<any> => {
            console.log("session",session)
            if(!session.user?.email) {
                return {error: SIGN_IN_ERROR}
            }
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
            console.log("token",token)
            return token
        }
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }