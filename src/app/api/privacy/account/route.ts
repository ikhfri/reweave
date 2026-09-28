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

    /*
     * Delete the account inside a transaction.
     *
     * Child records must either:
     * - have onDelete: Cascade in Prisma schema, or
     * - be explicitly deleted before the user.
     */
    await prisma.$transaction(
      async (tx) => {
        await tx.user.delete({
          where: {
            id: user.id,
          },
        });
      },
    );

    return NextResponse.json({
      success: true,
      message:
        "Account deleted successfully.",
    });
  } catch (error) {
    console.error(
      "[Privacy] Delete account error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete account.",
      },
      { status: 500 },
    );
  }
}