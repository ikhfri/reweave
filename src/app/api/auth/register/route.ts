import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import { createEmailVerificationOtp } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email";
import { verificationOtpTemplate } from "@/lib/email/templates/verification-otp";

const AI_CONSENT_VERSION = "1.0";
const PRIVACY_POLICY_VERSION = "1.0";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const payload = body as Record<string, unknown>;

    // Agreement wajib diberikan secara eksplisit oleh pengguna.
    if (
      payload.aiConsent !== true ||
      payload.privacyConsent !== true
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "CONSENT_REQUIRED",
          message:
            "You must agree to AI usage and the Privacy Policy to register.",
          errors: {
            aiConsent:
              payload.aiConsent !== true
                ? "AI usage agreement is required."
                : undefined,
            privacyConsent:
              payload.privacyConsent !== true
                ? "Privacy Policy agreement is required."
                : undefined,
          },
        },
        { status: 400 },
      );
    }

    const result = registerSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check your registration details.",
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { name, nickname, email, password } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_ALREADY_REGISTERED",
          message: "Email is already registered.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const acceptedAt = new Date();

    // Buat akun dan bukti persetujuan secara atomik.
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: name.trim(),
          nickname: nickname?.trim() || null,
          email: normalizedEmail,
          passwordHash,
          emailVerifiedAt: null,
        },
        select: {
          id: true,
          name: true,
          nickname: true,
          email: true,
          onboardingCompleted: true,
        },
      });

      await tx.userConsent.createMany({
        data: [
          {
            userId: createdUser.id,
            consentType: "AI_USAGE",
            version: AI_CONSENT_VERSION,
            acceptedAt,
          },
          {
            userId: createdUser.id,
            consentType: "PRIVACY_POLICY",
            version: PRIVACY_POLICY_VERSION,
            acceptedAt,
          },
        ],
      });

      return createdUser;
    });

    // Pertahankan alur autentikasi dan verifikasi email Moodify.
    await createSession(user.id);

    const verification = await createEmailVerificationOtp(user.id);
    const displayName = user.nickname?.trim() || user.name;

    const emailTemplate = verificationOtpTemplate({
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
      console.error("REGISTER_EMAIL_ERROR", emailError);

      // Akun dan persetujuan sudah tersimpan.
      // Pengguna dapat meminta pengiriman ulang OTP.
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
            onboardingCompleted: user.onboardingCompleted,
          },
          message:
            "Account created, but verification email could not be sent.",
        },
        { status: 201 },
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
          onboardingCompleted: user.onboardingCompleted,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    // Prisma P2002: unique constraint, misalnya dua request
    // registrasi untuk email yang sama pada waktu bersamaan.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_ALREADY_REGISTERED",
          message: "Email is already registered.",
        },
        { status: 409 },
      );
    }

    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 },
    );
  }
}