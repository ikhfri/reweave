import { NextResponse } from "next/server";

import {
  processDailyCheckinReminders,
} from "@/lib/reminders/daily-checkin";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request
) {
  try {
    const cronSecret =
      process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error(
        "CRON_SECRET is not configured."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Cron is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      authorization !==
      `Bearer ${cronSecret}`
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const result =
      await processDailyCheckinReminders();

    return NextResponse.json({
      success: true,
      ...result,
      executedAt:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "SEND_REMINDERS_CRON_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to process reminders.",
      },
      {
        status: 500,
      }
    );
  }
}