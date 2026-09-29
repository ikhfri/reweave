import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyEmailOtp } from "@/lib/auth/otp";

const verifySchema = z.object({
  userId: z.string().min(1),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP format",
        },
        {
          status: 400,
        }
      );
    }

    const { userId, otp } = result.data;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
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

    // User sudah terverifikasi sebelumnya
    if (user.emailVerifiedAt) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
      });
    }

    const verification = await verifyEmailOtp(userId, otp);

    if (!verification.success) {
      switch (verification.reason) {
        case "NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Kode verifikasi tidak ditemukan.",
            },
            {
              status: 404,
            }
          );

        case "EXPIRED":
          return NextResponse.json(
            {
              success: false,
              message: "Kode verifikasi sudah kedaluwarsa.",
            },
            {
              status: 400,
            }
          );

        case "TOO_MANY_ATTEMPTS":
          return NextResponse.json(
            {
              success: false,
              message:
                "Terlalu banyak percobaan. Silakan minta kode baru.",
            },
            {
              status: 429,
            }
          );

        case "INVALID":
          return NextResponse.json(
            {
              success: false,
              message: "Kode verifikasi salah.",
            },
            {
              status: 400,
            }
          );
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error("VERIFY_EMAIL_ERROR", error);

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