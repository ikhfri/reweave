import { randomInt } from "crypto";

import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export const OTP_EXPIRATION_MINUTES = 10;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;

export function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

/**
 * ============================================================
 * EMAIL VERIFICATION
 * ============================================================
 */

export async function createEmailVerificationOtp(userId: string) {
  const now = new Date();

  const latestOtp = await prisma.otpVerification.findFirst({
    where: {
      userId,
      purpose: "EMAIL_VERIFICATION",
      createdAt: {
        gte: new Date(
          now.getTime() - OTP_RESEND_COOLDOWN_SECONDS * 1000,
        ),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (latestOtp) {
    const elapsedSeconds =
      (now.getTime() - latestOtp.createdAt.getTime()) / 1000;

    const remainingSeconds = Math.ceil(
      OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds,
    );

    throw new Error(`OTP_COOLDOWN:${remainingSeconds}`);
  }

  await prisma.otpVerification.updateMany({
    where: {
      userId,
      purpose: "EMAIL_VERIFICATION",
      verifiedAt: null,
    },
    data: {
      verifiedAt: now,
    },
  });

  const otp = generateOtp();
  const otpHash = await hashPassword(otp);

  const expiresAt = new Date(
    now.getTime() + OTP_EXPIRATION_MINUTES * 60 * 1000,
  );

  const verification = await prisma.otpVerification.create({
    data: {
      userId,
      otpHash,
      purpose: "EMAIL_VERIFICATION",
      expiresAt,
      lastSentAt: now,
    },
  });

  return {
    id: verification.id,
    otp,
    expiresAt,
  };
}

export async function verifyEmailOtp(
  userId: string,
  otp: string,
) {
  const verification = await prisma.otpVerification.findFirst({
    where: {
      userId,
      purpose: "EMAIL_VERIFICATION",
      verifiedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!verification) {
    return {
      success: false,
      reason: "NOT_FOUND" as const,
    };
  }

  if (verification.expiresAt < new Date()) {
    return {
      success: false,
      reason: "EXPIRED" as const,
    };
  }

  if (verification.attempts >= OTP_MAX_ATTEMPTS) {
    return {
      success: false,
      reason: "TOO_MANY_ATTEMPTS" as const,
    };
  }

  const valid = await verifyPassword(
    otp,
    verification.otpHash,
  );

  if (!valid) {
    await prisma.otpVerification.update({
      where: {
        id: verification.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    return {
      success: false,
      reason: "INVALID" as const,
    };
  }

  await prisma.$transaction([
    prisma.otpVerification.update({
      where: {
        id: verification.id,
      },
      data: {
        verifiedAt: new Date(),
      },
    }),

    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    }),
  ]);

  return {
    success: true,
  };
}

/**
 * ============================================================
 * PASSWORD RESET
 * ============================================================
 */

export async function createPasswordResetOtp(userId: string) {
  const now = new Date();

  const latestOtp = await prisma.otpVerification.findFirst({
    where: {
      userId,
      purpose: "RESET_PASSWORD",
      createdAt: {
        gte: new Date(
          now.getTime() - OTP_RESEND_COOLDOWN_SECONDS * 1000,
        ),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (latestOtp) {
    const elapsedSeconds =
      (now.getTime() - latestOtp.createdAt.getTime()) / 1000;

    const remainingSeconds = Math.ceil(
      OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds,
    );

    throw new Error(`OTP_COOLDOWN:${remainingSeconds}`);
  }

  /**
   * Invalidate OTP reset password sebelumnya.
   *
   * verifiedAt dipakai sebagai tanda OTP sudah tidak aktif.
   */
  await prisma.otpVerification.updateMany({
    where: {
      userId,
      purpose: "RESET_PASSWORD",
      verifiedAt: null,
    },
    data: {
      verifiedAt: now,
    },
  });

  const otp = generateOtp();
  const otpHash = await hashPassword(otp);

  const expiresAt = new Date(
    now.getTime() + OTP_EXPIRATION_MINUTES * 60 * 1000,
  );

  const verification = await prisma.otpVerification.create({
    data: {
      userId,
      otpHash,
      purpose: "RESET_PASSWORD",
      expiresAt,
      lastSentAt: now,
    },
  });

  return {
    id: verification.id,
    otp,
    expiresAt,
  };
}

export async function verifyPasswordResetOtp(
  userId: string,
  otp: string,
) {
  const verification = await prisma.otpVerification.findFirst({
    where: {
      userId,
      purpose: "RESET_PASSWORD",
      verifiedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!verification) {
    return {
      success: false,
      reason: "NOT_FOUND" as const,
    };
  }

  if (verification.expiresAt < new Date()) {
    return {
      success: false,
      reason: "EXPIRED" as const,
    };
  }

  if (verification.attempts >= OTP_MAX_ATTEMPTS) {
    return {
      success: false,
      reason: "TOO_MANY_ATTEMPTS" as const,
    };
  }

  const valid = await verifyPassword(
    otp,
    verification.otpHash,
  );

  if (!valid) {
    await prisma.otpVerification.update({
      where: {
        id: verification.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    return {
      success: false,
      reason: "INVALID" as const,
    };
  }

  /**
   * Jangan langsung mengubah password di sini.
   *
   * Function ini hanya memvalidasi OTP.
   * Password baru akan diubah oleh API reset-password
   * setelah OTP berhasil diverifikasi.
   */
  return {
    success: true,
    verificationId: verification.id,
  };
}