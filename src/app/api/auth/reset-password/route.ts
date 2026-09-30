import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyPasswordResetOtp } from "@/lib/auth/otp";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    otp: z
      .string()
      .regex(/^\d{6}$/, "OTP must be 6 digits"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),

    confirmPassword: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data reset password tidak valid.",
          errors: result.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const {
      email,
      otp,
      password,
    } = result.data;

    /**
     * ========================================================
     * FIND USER
     * ========================================================
     */
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kode reset password tidak valid atau sudah kedaluwarsa.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * ========================================================
     * VERIFY OTP
     * ========================================================
     */
    const verification = await verifyPasswordResetOtp(
      user.id,
      otp,
    );

    if (!verification.success) {
      switch (verification.reason) {
        case "NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              code: "OTP_NOT_FOUND",
              message:
                "Kode reset password tidak ditemukan. Silakan minta kode baru.",
            },
            {
              status: 400,
            },
          );

        case "EXPIRED":
          return NextResponse.json(
            {
              success: false,
              code: "OTP_EXPIRED",
              message:
                "Kode reset password sudah kedaluwarsa. Silakan minta kode baru.",
            },
            {
              status: 400,
            },
          );

        case "TOO_MANY_ATTEMPTS":
          return NextResponse.json(
            {
              success: false,
              code: "OTP_TOO_MANY_ATTEMPTS",
              message:
                "Terlalu banyak percobaan. Silakan minta kode baru.",
            },
            {
              status: 429,
            },
          );

        case "INVALID":
          return NextResponse.json(
            {
              success: false,
              code: "OTP_INVALID",
              message:
                "Kode reset password salah.",
            },
            {
              status: 400,
            },
          );
      }
    }

    /**
     * ========================================================
     * HASH NEW PASSWORD
     * ========================================================
     */
    const passwordHash = await hashPassword(password);

    /**
     * ========================================================
     * UPDATE PASSWORD + INVALIDATE OTP + SESSIONS
     * ========================================================
     *
     * Semua dilakukan dalam satu transaction.
     *
     * Setelah password berubah:
     *
     * - password lama tidak berlaku
     * - OTP tidak bisa digunakan kembali
     * - semua session lama dihapus
     */
    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash,
          authProvider: "PASSWORD",
        },
      }),

      prisma.otpVerification.update({
        where: {
          id: verification.verificationId,
        },
        data: {
          verifiedAt: new Date(),
        },
      }),

      prisma.session.deleteMany({
        where: {
          userId: user.id,
        },
      }),
    ]);

    /**
     * ========================================================
     * SUCCESS
     * ========================================================
     */
    return NextResponse.json({
      success: true,
      message:
        "Password berhasil diubah. Silakan masuk kembali.",
    });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan. Silakan coba lagi.",
      },
      {
        status: 500,
      },
    );
  }
}