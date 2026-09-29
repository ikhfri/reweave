import { prisma } from "@/lib/prisma";

import { sendEmail } from "@/lib/email/mailer";

import {
  createDailyCheckinReminderEmail,
} from "@/lib/email/templates/daily-checkin-reminder";

import {
  getLocalDateTime,
  getLocalDayRange,
} from "@/lib/date/timezone";

type ReminderResult = {
  checked: number;
  sent: number;
  skipped: number;
  failed: number;
};

const REMINDER_WINDOW_MINUTES = 10;

function timeToMinutes(
  value: string,
): number | null {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const [hourString, minuteString] =
    value.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
}

function isReminderDue(
  currentTime: string,
  reminderTime: string,
) {
  const currentMinutes =
    timeToMinutes(currentTime);

  const reminderMinutes =
    timeToMinutes(reminderTime);

  if (
    currentMinutes === null ||
    reminderMinutes === null
  ) {
    return false;
  }

  const difference =
    currentMinutes -
    reminderMinutes;

  /*
   * Cron berjalan berkala.
   *
   * Contoh:
   *
   * User:
   * 08:00
   *
   * Cron:
   * 08:00 → kirim
   * 08:05 → masih valid
   * 08:10 → masih valid jika konfigurasi
   *        window memungkinkan
   *
   * Setelah window lewat → skip.
   */

  return (
    difference >= 0 &&
    difference < REMINDER_WINDOW_MINUTES
  );
}

export async function processDailyCheckinReminders(): Promise<ReminderResult> {
  const result: ReminderResult = {
    checked: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
  };

  const now = new Date();

  /*
   * Ambil user yang:
   *
   * 1. Reminder aktif
   * 2. Sudah menentukan jam check-in
   * 3. Email sudah diverifikasi
   */

  const preferences =
    await prisma.userPreference.findMany({
      where: {
        notificationEnabled: true,

        dailyCheckinTime: {
          not: null,
        },

        user: {
          emailVerifiedAt: {
            not: null,
          },
        },
      },

      select: {
        dailyCheckinTime: true,
        timezone: true,
        language: true,

        user: {
          select: {
            id: true,
            email: true,
            name: true,
            nickname: true,
          },
        },
      },
    });

  for (const preference of preferences) {
    result.checked += 1;

    try {
      const reminderTime =
        preference.dailyCheckinTime;

      if (!reminderTime) {
        result.skipped += 1;
        continue;
      }

      /*
       * Default Moodify:
       * Asia/Jakarta
       */

      const timezone =
        preference.timezone ||
        "Asia/Jakarta";

      /*
       * Dapatkan tanggal dan jam
       * berdasarkan timezone user.
       */

      const local =
        getLocalDateTime(
          now,
          timezone,
        );

      /*
       * Belum waktunya reminder.
       */

      if (
        !isReminderDue(
          local.time,
          reminderTime,
        )
      ) {
        result.skipped += 1;
        continue;
      }

      /*
       * Pastikan hari ini belum pernah
       * dikirimi reminder.
       */

      const existingLog =
        await prisma.reminderLog.findUnique({
          where: {
            userId_type_reminderDate: {
              userId:
                preference.user.id,

              type:
                "DAILY_CHECKIN",

              reminderDate:
                local.date,
            },
          },

          select: {
            id: true,
          },
        });

      if (existingLog) {
        result.skipped += 1;
        continue;
      }

      /*
       * Tentukan range hari lokal user.
       *
       * Contoh Asia/Jakarta:
       *
       * 2026-09-29 00:00 WIB
       * sampai
       * 2026-09-30 00:00 WIB
       */

      const {
        start,
        end,
      } = getLocalDayRange(
        now,
        timezone,
      );

      /*
       * Cek apakah user sudah melakukan
       * check-in hari ini.
       */

      const checkin =
        await prisma.dailyCheckin.findFirst({
          where: {
            userId:
              preference.user.id,

            checkinDate: {
              gte: start,
              lt: end,
            },
          },

          select: {
            id: true,
          },
        });

      /*
       * Kalau sudah check-in,
       * jangan kirim reminder.
       */

      if (checkin) {
        result.skipped += 1;
        continue;
      }

      /*
       * Tentukan bahasa email.
       */

      const locale =
        preference.language === "EN"
          ? "en"
          : "id";

      /*
       * Gunakan nickname jika tersedia.
       * Kalau tidak, gunakan name.
       */

      const displayName =
        preference.user.nickname?.trim() ||
        preference.user.name.trim();

      /*
       * Buat template email.
       */

      const template =
        createDailyCheckinReminderEmail({
          name: displayName,
          locale,
        });

      /*
       * Kirim email.
       */

      await sendEmail({
        to: preference.user.email,

        subject:
          template.subject,

        text:
          template.text,

        html:
          template.html,
      });

      /*
       * Email berhasil dikirim.
       *
       * Simpan log supaya cron berikutnya
       * tidak mengirim email yang sama lagi.
       */

      await prisma.reminderLog.create({
        data: {
          userId:
            preference.user.id,

          type:
            "DAILY_CHECKIN",

          reminderDate:
            local.date,
        },
      });

      result.sent += 1;

      console.info(
        `[Moodify Reminder] Sent daily check-in reminder to ${preference.user.email}`,
      );
    } catch (error) {
      result.failed += 1;

      console.error(
        `[Moodify Reminder] Failed for user ${preference.user.id}`,
        error,
      );
    }
  }

  return result;
}