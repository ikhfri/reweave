import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama terlalu panjang")
    .optional(),

  nickname: z
    .string()
    .trim()
    .max(50, "Nickname terlalu panjang")
    .nullable()
    .optional(),

  language: z.enum(["ID", "EN"]).optional(),

  communicationStyle: z
    .enum(["GENTLE", "PRACTICAL", "BALANCED"])
    .optional(),

  supportPreference: z
    .enum([
      "LISTEN",
      "UNDERSTAND",
      "CALM_ACTIVITY",
      "REFLECTION",
      "PRACTICAL_STEPS",
      "SPACE",
    ])
    .optional(),

  journalingPreference: z
    .enum([
      "WRITING",
      "TALKING",
      "TRACKING",
      "CALMING_ACTIVITIES",
      "EVERYTHING",
    ])
    .optional(),

  notificationEnabled: z.boolean().optional(),

  dailyCheckinTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Format waktu harus HH:mm",
    )
    .nullable()
    .optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const settings = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        email: true,
        gender: true,
        dateOfBirth: true,
        avatarUrl: true,

        preference: {
          select: {
            language: true,
            communicationStyle: true,
            supportPreference: true,
            journalingPreference: true,
            notificationEnabled: true,
            dailyCheckinTime: true,
          },
        },
      },
    });

    if (!settings) {
      return NextResponse.json(
        {
          message: "User tidak ditemukan",
        },
        {
          status: 404,
        },
      );
    }

    const preference =
      settings.preference ??
      (await prisma.userPreference.create({
        data: {
          userId: settings.id,
        },
        select: {
          language: true,
          communicationStyle: true,
          supportPreference: true,
          journalingPreference: true,
          notificationEnabled: true,
          dailyCheckinTime: true,
        },
      }));

    return NextResponse.json({
      settings: {
        id: settings.id,
        name: settings.name,
        nickname: settings.nickname,
        email: settings.email,
        gender: settings.gender,
        dateOfBirth: settings.dateOfBirth,
        avatarUrl: settings.avatarUrl,
        preference,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/settings error:",
      error,
    );

    return NextResponse.json(
      {
        message: "Gagal mengambil pengaturan",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();

    const parsed =
      updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            "Data pengaturan tidak valid",
          errors:
            parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const {
      name,
      nickname,
      language,
      communicationStyle,
      supportPreference,
      journalingPreference,
      notificationEnabled,
      dailyCheckinTime,
    } = parsed.data;

    const result =
      await prisma.$transaction(
        async (tx) => {
          /**
           * Update profile
           */
          if (
            name !== undefined ||
            nickname !== undefined
          ) {
            await tx.user.update({
              where: {
                id: user.id,
              },
              data: {
                ...(name !== undefined && {
                  name,
                }),

                ...(nickname !== undefined && {
                  nickname:
                    nickname === ""
                      ? null
                      : nickname,
                }),
              },
            });
          }

          /**
           * Update preferences
           */
          const preference =
            await tx.userPreference.upsert({
              where: {
                userId: user.id,
              },

              create: {
                userId: user.id,

                ...(language !== undefined && {
                  language,
                }),

                ...(communicationStyle !==
                  undefined && {
                  communicationStyle,
                }),

                ...(supportPreference !==
                  undefined && {
                  supportPreference,
                }),

                ...(journalingPreference !==
                  undefined && {
                  journalingPreference,
                }),

                ...(notificationEnabled !==
                  undefined && {
                  notificationEnabled,
                }),

                ...(dailyCheckinTime !==
                  undefined && {
                  dailyCheckinTime,
                }),
              },

              update: {
                ...(language !== undefined && {
                  language,
                }),

                ...(communicationStyle !==
                  undefined && {
                  communicationStyle,
                }),

                ...(supportPreference !==
                  undefined && {
                  supportPreference,
                }),

                ...(journalingPreference !==
                  undefined && {
                  journalingPreference,
                }),

                ...(notificationEnabled !==
                  undefined && {
                  notificationEnabled,
                }),

                ...(dailyCheckinTime !==
                  undefined && {
                  dailyCheckinTime,
                }),
              },

              select: {
                language: true,
                communicationStyle: true,
                supportPreference: true,
                journalingPreference: true,
                notificationEnabled: true,
                dailyCheckinTime: true,
              },
            });

          /**
           * Get updated user
           */
          const updatedUser =
            await tx.user.findUnique({
              where: {
                id: user.id,
              },

              select: {
                id: true,
                name: true,
                nickname: true,
                email: true,
              },
            });

          return {
            user: updatedUser,
            preference,
          };
        },
      );

    return NextResponse.json({
      message:
        "Pengaturan berhasil disimpan",
      settings: result,
    });
  } catch (error) {
    console.error(
      "PATCH /api/settings error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Gagal menyimpan pengaturan",
      },
      {
        status: 500,
      },
    );
  }
}