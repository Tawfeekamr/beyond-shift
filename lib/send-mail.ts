import nodemailer from 'nodemailer';

//-----------------------------------------------------------------------------
export async function sendNodeMailer(subject: string, toEmail: string, otpText: string): Promise<any> {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_EMAIL_ADDRESS,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_EMAIL_ADDRESS,
        to: toEmail,
        subject: subject,
        text: `Your OTP is ${otpText}, will expire at after 15 minutes`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Email not Sent", error);
            throw new Error(error?.message ? error.message : "Error sending mail");
        } else {
            console.log("Email Sent");
            return true;
        }
    });
}

// export default function handler(req, res) {
//
//     const message = {
//         from: process.env.GMAIL_EMAIL_ADDRESS,
//         to: req.body.email,
//         subject: req.body.subject,
//         text: req.body.message,
//         html: `<p>${req.body.message}</p>`,
//     };
//
//     let transporter = nodemailer.createTransport({
//         service: 'Gmail',
//         auth: {
//             user: process.env.GMAIL_EMAIL_ADDRESS,
//             pass: process.env.GMAIL_APP_PASSWORD,
//         },
//     });
//
//     if (req.method === 'POST') {
//         transporter.sendMail(message, (err, info) => {
//
//             if (err) {
//                 res.status(404).json({
//                     error: `Connection refused at ${err.address}`
//                 });
//             } else {
//                 res.status(250).json({
//                     success: `Message delivered to ${info.accepted}`
//                 });
//             }
//         });
//     }
// }