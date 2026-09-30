import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

import { createPasswordResetOtp } from "@/lib/auth/otp";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
});

const GENERIC_MESSAGE =
  "Jika email terdaftar, kode reset password telah dikirim.";

function getMailer() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    throw new Error(
      "SMTP is not configured. Missing SMTP_HOST, SMTP_USER, or SMTP_PASSWORD.",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password,
    },
  });
}

function getFromAddress() {
  return (
    process.env.SMTP_FROM ||
    `Moodify <${process.env.SMTP_USER || "no-reply@moodify.app"}>`
  );
}

function buildResetEmail(
  otp: string,
  expiresInMinutes: number,
) {
  return {
    subject: "Kode Reset Password Moodify",
    text: [
      "Moodify",
      "",
      "Kami menerima permintaan untuk mereset password akun Moodify kamu.",
      "",
      `Kode reset password kamu: ${otp}`,
      "",
      `Kode ini berlaku selama ${expiresInMinutes} menit.`,
      "",
      "Jika kamu tidak meminta reset password, abaikan email ini.",
      "",
      "Moodify",
    ].join("\n"),

    html: `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Kode Reset Password Moodify</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background: #fdfbf7;
            font-family: Arial, Helvetica, sans-serif;
            color: #4a3f35;
          "
        >
          <div
            style="
              width: 100%;
              padding: 48px 20px;
              box-sizing: border-box;
            "
          >
            <div
              style="
                max-width: 520px;
                margin: 0 auto;
                background: #ffffff;
                border: 1px solid rgba(74, 63, 53, 0.08);
                border-radius: 24px;
                padding: 40px 32px;
                box-sizing: border-box;
              "
            >
              <div style="text-align: center; margin-bottom: 32px;">
                <div
                  style="
                    display: inline-block;
                    padding: 10px 16px;
                    background: #fbc4ab;
                    border-radius: 14px;
                    color: #4a3f35;
                    font-size: 18px;
                    font-weight: 700;
                  "
                >
                  Moodify
                </div>
              </div>

              <h1
                style="
                  margin: 0 0 12px;
                  font-size: 26px;
                  line-height: 1.3;
                  color: #4a3f35;
                "
              >
                Reset password
              </h1>

              <p
                style="
                  margin: 0 0 28px;
                  font-size: 15px;
                  line-height: 1.7;
                  color: rgba(74, 63, 53, 0.65);
                "
              >
                Kami menerima permintaan untuk mereset password akun
                Moodify kamu.
              </p>

              <div
                style="
                  margin: 28px 0;
                  padding: 24px;
                  background: #fdfbf7;
                  border: 1px solid rgba(74, 63, 53, 0.08);
                  border-radius: 18px;
                  text-align: center;
                "
              >
                <p
                  style="
                    margin: 0 0 10px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #5c6b9c;
                  "
                >
                  Kode reset password
                </p>

                <div
                  style="
                    font-size: 34px;
                    line-height: 1;
                    letter-spacing: 8px;
                    font-weight: 700;
                    color: #4a3f35;
                  "
                >
                  ${otp}
                </div>
              </div>

              <p
                style="
                  margin: 0 0 12px;
                  font-size: 13px;
                  line-height: 1.6;
                  color: rgba(74, 63, 53, 0.55);
                "
              >
                Kode ini berlaku selama
                <strong style="color: #4a3f35;">
                  ${expiresInMinutes} menit
                </strong>.
              </p>

              <p
                style="
                  margin: 24px 0 0;
                  padding-top: 24px;
                  border-top: 1px solid rgba(74, 63, 53, 0.08);
                  font-size: 12px;
                  line-height: 1.7;
                  color: rgba(74, 63, 53, 0.4);
                "
              >
                Jika kamu tidak meminta reset password, abaikan email ini.
                Password kamu tidak akan berubah tanpa kode ini.
              </p>
            </div>

            <p
              style="
                max-width: 520px;
                margin: 20px auto 0;
                text-align: center;
                font-size: 11px;
                line-height: 1.6;
                color: rgba(74, 63, 53, 0.35);
              "
            >
              Moodify · Emotional Wellbeing Companion
            </p>
          </div>
        </body>
      </html>
    `,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Email tidak valid.",
        },
        {
          status: 400,
        },
      );
    }

    const email = result.data.email;

    /**
     * ========================================================
     * FIND USER
     * ========================================================
     *
     * Jangan membocorkan apakah email terdaftar atau tidak.
     */
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: GENERIC_MESSAGE,
      });
    }

    /**
     * ========================================================
     * CREATE OTP
     * ========================================================
     */
    let verification;

    try {
      verification = await createPasswordResetOtp(user.id);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith("OTP_COOLDOWN:")
      ) {
        const retryAfter = Number(
          error.message.split(":")[1] || 60,
        );

        return NextResponse.json(
          {
            success: false,
            code: "OTP_COOLDOWN",
            message: `Silakan tunggu ${retryAfter} detik sebelum meminta kode baru.`,
            retryAfter,
          },
          {
            status: 429,
          },
        );
      }

      throw error;
    }

    /**
     * ========================================================
     * SEND EMAIL
     * ========================================================
     */
    try {
      const transporter = getMailer();

      const emailContent = buildResetEmail(
        verification.otp,
        10,
      );

      await transporter.sendMail({
        from: getFromAddress(),
        to: user.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error("FORGOT_PASSWORD_EMAIL_ERROR", emailError);

      /**
       * Email gagal dikirim.
       *
       * OTP yang baru dibuat harus dinonaktifkan supaya
       * kode yang tidak pernah diterima user tidak tetap valid.
       */
      await prisma.otpVerification.update({
        where: {
          id: verification.id,
        },
        data: {
          verifiedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Kode reset password gagal dikirim. Silakan coba lagi.",
        },
        {
          status: 500,
        },
      );
    }

    /**
     * ========================================================
     * SUCCESS
     * ========================================================
     */
    return NextResponse.json({
      success: true,
      message: GENERIC_MESSAGE,
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);

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