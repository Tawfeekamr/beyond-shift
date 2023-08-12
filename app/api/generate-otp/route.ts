import {NextResponse} from "next/server";

import {expiryOTP, generateOTP} from "@/lib/utils";
import {prismadb} from "@/lib/prismadb";
import {sendNodeMailer} from "@/lib/send-mail";

export async function POST(
    request: Request,
) {
    const body = await request.json();
    const {id} = body;

    try {

        if (!id) {
            new NextResponse("User id not sent", {status: 400})
        }

        const otp = generateOTP();
        console.log("body", body)
        const createdOtp = await prismadb.oTP.create({
            data: {
                userId: id,
                code: otp,
                expiresAt: expiryOTP()
            }
        });

        if (!createdOtp) {
            new NextResponse("User email or password not found", {status: 400})
        }

        await sendNodeMailer("Email Verification", id, createdOtp.code);

        return new NextResponse("OTP created successfully");

    } catch (err: any) {
        console.log(err.message)
        return new NextResponse(`Internal error: ${err?.message}`, {status: 500})
    }


}