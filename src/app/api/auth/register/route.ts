import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import {
  createEmailVerificationOtp,
} from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email";
import {
  verificationOtpTemplate,
} from "@/lib/email/templates/verification-otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const {
      name,
      nickname,
      email,
      password,
    } = result.data;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is already registered",
        },
        {
          status: 409,
        }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        nickname:
          nickname?.trim()
            ? nickname.trim()
            : null,
        email: normalizedEmail,
        passwordHash,
        emailVerifiedAt: null,
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        email: true,
        emailVerifiedAt: true,
        onboardingCompleted: true,
      },
    });

    await createSession(user.id);

    const verification = await createEmailVerificationOtp(
      user.id
    );

    const displayName =
      user.nickname?.trim() || user.name;

    const emailTemplate =
      verificationOtpTemplate({
        name: displayName,
        otp: verification.otp,
      });

    try {
      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      });
    } catch (emailError) {
      console.error(
        "REGISTER_EMAIL_ERROR",
        emailError
      );

      // Account sudah dibuat.
      // User tetap bisa meminta resend OTP.
      return NextResponse.json(
        {
          success: true,
          emailVerificationRequired: true,
          emailSent: false,
          user: {
            id: user.id,
            name: user.name,
            nickname: user.nickname,
            email: user.email,
            onboardingCompleted:
              user.onboardingCompleted,
          },
          message:
            "Account created, but verification email could not be sent.",
        },
        {
          status: 201,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        emailVerificationRequired: true,
        emailSent: true,
        user: {
          id: user.id,
          name: user.name,
          nickname: user.nickname,
          email: user.email,
          onboardingCompleted:
            user.onboardingCompleted,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}