import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Verification from "@/models/Verification";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { identifier, type } = await req.json();

    if (!identifier || !type) {
      return NextResponse.json({ success: false, error: "Identifier and type are required" }, { status: 400 });
    }

    await dbConnect();

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to Database
    await Verification.create({
      identifier,
      code: otp,
      type
    });

    if (identifier.includes("@")) {
      // Send Email using Nodemailer
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: identifier,
          subject: 'EduShield - Your Verification Code',
          text: `Your EduShield verification code is: ${otp}. It will expire in 30 minutes.`
        };

        await transporter.sendMail(mailOptions);
      } else {
         // Mock Email for development if keys aren't set
         console.log(`[Email Mock] Sent OTP ${otp} to ${identifier}`);
      }
    } else {
      // Mock SMS for Phone Numbers
      console.log(`[SMS Mock] Sent OTP ${otp} to ${identifier}`);
    }

    const isMock = !process.env.EMAIL_USER || !process.env.EMAIL_PASS;
    return NextResponse.json({ 
      success: true, 
      message: isMock ? `Mock Dev OTP: ${otp}` : "Verification code sent successfully",
      otp: isMock ? otp : undefined
    });

  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ success: false, error: "Failed to send verification code" }, { status: 500 });
  }
}
