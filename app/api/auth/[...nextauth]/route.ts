import {compare} from 'bcrypt'
import NextAuth, {type NextAuthOptions} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import {prismadb} from "@/lib/prismadb";
import {NextResponse} from "next/server";
import {SIGN_IN_ERROR} from "@/utils/statics";
import axios from "axios";
import {expiryOTP, generateOTP, isNotExpiredOTP} from "@/lib/utils";
import {sendNodeMailer} from "@/lib/send-mail";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
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
                password: {label: 'Password', type: 'password'}
            },
            //@ts-ignore
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return new NextResponse(SIGN_IN_ERROR).json()
                }

                const user = await prismadb.user.findFirst({
                    where: {
                        email: credentials.email
                    }
                })

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
                await prismadb.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        lastLogin: new Date()
                    }
                })
                const otp = generateOTP();
                const otpExpiry = expiryOTP();

                const validOTP = await prismadb.oTP.findFirst(
                    {
                        where: {
                            userId: user.id,
                            usedAt: null
                        }
                    }
                )

                if(isNotExpiredOTP(validOTP?.expiresAt)) {
                    await axios.post("/send-email", {
                        email: user.email,
                        message: `Your OTP is ${otp}, will expire at ${otpExpiry}`
                    })
                } else {
                    const createdOtp = await prismadb.oTP.create({
                        data: {
                            userId: user.id,
                            code: otp,
                            expiresAt: expiryOTP()
                        }
                    });

                    if (!createdOtp) {
                        return new NextResponse("OTP not created, try later.", {status: 500}).json()
                    } else {
                      await sendNodeMailer("Email Verification", user.email, createdOtp.code)
                    }

                }

                return {
                    id: user.id + '',
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    isVerified: user.isVerified
                }
            }
        })
    ],

    callbacks: {
        session: async ({session, token}): Promise<any> => {
            console.log("[AUTH] session", session)
            if (!session.user?.email) {
                return {error: SIGN_IN_ERROR}
            }
           const user = await prismadb.user.findFirst({
                where: {
                    //@ts-ignore
                    id: session?.user?.id
                }
            });


            if(!user) {
                return  {}
            }
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    isVerified: user?.isVerified,
                    image: user?.image,
                    name: user?.name
                }
            }
        },

        jwt: ({token, user}) => {
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
    },
}

const handler = NextAuth(authOptions)
export {handler as GET, handler as POST}