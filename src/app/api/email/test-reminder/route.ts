import { NextResponse } from "next/server";

import {
  sendEmail,
} from "@/lib/email/mailer";

import {
  createDailyCheckinReminderEmail,
} from "@/lib/email/templates/daily-checkin-reminder";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "kamu";

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required.",
        },
        {
          status: 400,
        }
      );
    }

    const template =
      createDailyCheckinReminderEmail({
        name,
        locale: "id",
      });

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    return NextResponse.json({
      success: true,
      message: "Test reminder email sent.",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error(
      "TEST_REMINDER_EMAIL_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send email.",
      },
      {
        status: 500,
      }
    );
  }
}