import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  createEmailVerificationOtp,
} from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email";
import {
  verificationOtpTemplate,
} from "@/lib/email/templates/verification-otp";

const schema = z.object({
  userId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request",
        },
        {
          status: 400,
        }
      );
    }

    const { userId } = result.data;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        emailVerifiedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
      });
    }

    let verification;

    try {
      verification =
        await createEmailVerificationOtp(
          user.id
        );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith(
          "OTP_COOLDOWN:"
        )
      ) {
        const seconds = Number(
          error.message.split(":")[1]
        );

        return NextResponse.json(
          {
            success: false,
            code: "OTP_COOLDOWN",
            retryAfter: seconds,
            message: `Please wait ${seconds} seconds before requesting another code.`,
          },
          {
            status: 429,
          }
        );
      }

      throw error;
    }

    const displayName =
      user.nickname?.trim() ||
      user.name;

    const emailTemplate =
      verificationOtpTemplate({
        name: displayName,
        otp: verification.otp,
      });

    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });

    return NextResponse.json({
      success: true,
      emailSent: true,
    });
  } catch (error) {
    console.error(
      "SEND_VERIFICATION_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to send verification email.",
      },
      {
        status: 500,
      }
    );
  }
}