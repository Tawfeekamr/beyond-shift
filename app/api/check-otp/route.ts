import { NextResponse } from "next/server";

import moment from "moment";
import {prismadb} from "@/lib/prismadb";
import {isNotExpiredOTP} from "@/lib/utils";

export async function POST(
    request: Request,
) {
    const body = await request.json();
    const { otp, id } = body;

    try {

        if(!id) {
            new NextResponse("User id not sent", {status: 400})
        }
        if(!otp) {
            new NextResponse("otp not sent", {status: 400})
        }
        const findOtp = await prismadb.oTP.findFirst({
            where: {
                userId: id,
                usedAt: null
            }
        });

        if(!findOtp) {
            new NextResponse("User email or password not found", {status: 400})
        }

        if(!isNotExpiredOTP(findOtp?.expiresAt)) {
            new NextResponse("OTP expired please resend the code again.", {status: 400})
        }

        if(findOtp && (findOtp?.code === otp)) {
            console.log("OTP correct");

            await prismadb.oTP.update({
                where: {
                    id: findOtp.id,
                },
                data: {
                    usedAt: new Date()
                }
            });
            await prismadb.user.update({
                where: {
                    id
                },
                data: {
                    isVerified: true
                }
            });
        } else if(!findOtp?.code) {
            return  new NextResponse(`OTP code not generated please press resend button.`, {status: 404})
        } else {
            return  new NextResponse(`OTP code is not correct `, {status: 404})
        }

        return NextResponse.json(findOtp);

    } catch (err: any) {
        console.log(err.message)
        return  new NextResponse(`Internal error: ${err?.message}`, {status: 500})
    }


}