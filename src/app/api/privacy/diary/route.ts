import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const diaryEntries =
      await prisma.diaryEntry.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

    const diaryEntryIds =
      diaryEntries.map(
        (entry) => entry.id,
      );

    await prisma.$transaction(
      async (tx) => {
        /*
         * AI analyses that specifically belong
         * to diary entries should be removed first.
         */
        if (diaryEntryIds.length > 0) {
          await tx.aIAnalysis.deleteMany({
            where: {
              userId: user.id,
              diaryEntryId: {
                in: diaryEntryIds,
              },
            },
          });
        }

        /*
         * Delete diary entries owned by this user.
         */
        await tx.diaryEntry.deleteMany({
          where: {
            userId: user.id,
          },
        });
      },
    );

    return NextResponse.json({
      success: true,
      message: "Diary deleted successfully.",
      deletedEntries:
        diaryEntryIds.length,
    });
  } catch (error) {
    console.error(
      "[Privacy] Delete diary error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete diary.",
      },
      { status: 500 },
    );
  }
}