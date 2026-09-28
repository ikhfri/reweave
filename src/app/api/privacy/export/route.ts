import { NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const COLORS = {
  ink: rgb(0.29, 0.25, 0.21),
  muted: rgb(0.29, 0.25, 0.21),
  primary: rgb(0.36, 0.42, 0.61),
  peach: rgb(0.89, 0.45, 0.36),
  softPeach: rgb(0.98, 0.77, 0.67),
  green: rgb(0.76, 0.84, 0.75),
  background: rgb(0.99, 0.98, 0.97),
  white: rgb(1, 1, 1),
  border: rgb(0.88, 0.86, 0.83),
};

function formatDate(date: Date | null | undefined) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDateOnly(date: Date | null | undefined) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(date);
}


function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size = 10,
  color = COLORS.ink,
) {
  page.drawText(text, {
    x,
    y,
    size,
    font,
    color,
  });
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  width: number,
  font: PDFFont,
  size = 10,
  lineHeight = 15,
  color = COLORS.ink,
) {
  const words = text.replace(/\r/g, "").split(/\s+/);

  let line = "";
  let currentY = y;

  const maxChars = Math.max(
    20,
    Math.floor(width / (size * 0.52)),
  );

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (candidate.length > maxChars && line) {
      drawText(
        page,
        line,
        x,
        currentY,
        font,
        size,
        color,
      );

      currentY -= lineHeight;
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) {
    drawText(
      page,
      line,
      x,
      currentY,
      font,
      size,
      color,
    );

    currentY -= lineHeight;
  }

  return currentY;
}

function drawSectionTitle(
  page: PDFPage,
  title: string,
  y: number,
  boldFont: PDFFont,
) {
  page.drawRectangle({
    x: 42,
    y: y - 7,
    width: 5,
    height: 20,
    color: COLORS.primary,
  });

  drawText(
    page,
    title,
    58,
    y,
    boldFont,
    15,
    COLORS.ink,
  );

  return y - 30;
}

function drawCard(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 0.8,
  });
}

export async function GET() {
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
     * --------------------------------------------------
     * GET USER DATA
     * --------------------------------------------------
     */

    const [
      account,
      preference,
      checkins,
      diaryEntries,
      analyses,
      emotionDescriptions,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          gender: true,
          dateOfBirth: true,
          createdAt: true,
        },
      }),

      prisma.userPreference.findUnique({
        where: {
          userId: user.id,
        },
        select: {
          language: true,
          communicationStyle: true,
          supportPreference: true,
          journalingPreference: true,
          notificationEnabled: true,
          dailyCheckinTime: true,
        },
      }),

      prisma.dailyCheckin.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          checkinDate: "desc",
        },
        include: {
          emotions: {
            orderBy: {
              position: "asc",
            },
            include: {
              emotion: {
                select: {
                  name: true,
                  slug: true,
                  category: true,
                },
              },
            },
          },
          contexts: {
            include: {
              context: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),

      prisma.diaryEntry.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          content: true,
          entryType: true,
          createdAt: true,
        },
      }),

      prisma.aIAnalysis.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          checkinId: true,
          diaryEntryId: true,
          summary: true,
          validationMessage: true,
          stressScore: true,
          sentiment: true,
          emotionalState: true,
          possibleTriggers: true,
          thinkingPatterns: true,
          recommendations: true,
          riskLevel: true,
          model: true,
          createdAt: true,
        },
      }),

      /*
       * Query separately so this route does not depend
       * on whether User currently has an emotionDescriptions
       * relation field.
       */
      prisma.emotionDescription.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          checkinId: true,
          description: true,
          aiEmotion: true,
          aiEmotionReason: true,
          confidence: true,
          createdAt: true,
        },
      }),
    ]);

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message: "User account not found.",
        },
        { status: 404 },
      );
    }

    /*
     * --------------------------------------------------
     * CREATE PDF
     * --------------------------------------------------
     */

    const pdf = await PDFDocument.create();

    const regularFont = await pdf.embedFont(
      StandardFonts.Helvetica,
    );

    const boldFont = await pdf.embedFont(
      StandardFonts.HelveticaBold,
    );

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    let page = pdf.addPage([
      pageWidth,
      pageHeight,
    ]);

    let y = pageHeight - 52;

    /*
     * --------------------------------------------------
     * PAGE HELPERS
     * --------------------------------------------------
     */

    function ensureSpace(requiredHeight: number) {
      if (y - requiredHeight < 48) {
        page = pdf.addPage([
          pageWidth,
          pageHeight,
        ]);

        y = pageHeight - 52;
      }
    }

    function footer() {
      const pages = pdf.getPages();

      pages.forEach((currentPage, index) => {
        currentPage.drawLine({
          start: {
            x: 42,
            y: 35,
          },
          end: {
            x: pageWidth - 42,
            y: 35,
          },
          thickness: 0.5,
          color: COLORS.border,
        });

        drawText(
          currentPage,
          "Moodify · Personal Data Export",
          42,
          21,
          regularFont,
          8,
          COLORS.muted,
        );

        drawText(
          currentPage,
          `${index + 1} / ${pages.length}`,
          pageWidth - 75,
          21,
          regularFont,
          8,
          COLORS.muted,
        );
      });
    }

    /*
     * --------------------------------------------------
     * COVER
     * --------------------------------------------------
     */

    page.drawRectangle({
      x: 0,
      y: pageHeight - 175,
      width: pageWidth,
      height: 175,
      color: COLORS.primary,
    });

    drawText(
      page,
      "Moodify",
      48,
      pageHeight - 75,
      boldFont,
      28,
      COLORS.white,
    );

    drawText(
      page,
      "Personal Data Export",
      48,
      pageHeight - 108,
      regularFont,
      15,
      COLORS.white,
    );

    drawText(
      page,
      "A copy of the personal information stored in your Moodify account.",
      48,
      pageHeight - 138,
      regularFont,
      9,
      COLORS.white,
    );

    y = pageHeight - 215;

    drawText(
      page,
      account.name,
      48,
      y,
      boldFont,
      20,
      COLORS.ink,
    );

    y -= 23;

    drawText(
      page,
      account.email,
      48,
      y,
      regularFont,
      10,
      COLORS.muted,
    );

    y -= 45;

    page.drawRectangle({
      x: 48,
      y: y - 80,
      width: pageWidth - 96,
      height: 80,
      color: COLORS.background,
      borderColor: COLORS.border,
      borderWidth: 0.7,
    });

    drawText(
      page,
      "Generated",
      66,
      y - 27,
      regularFont,
      9,
      COLORS.muted,
    );

    drawText(
      page,
      formatDate(new Date()),
      66,
      y - 43,
      boldFont,
      10,
      COLORS.ink,
    );

    drawText(
      page,
      "Account created",
      300,
      y - 27,
      regularFont,
      9,
      COLORS.muted,
    );

    drawText(
      page,
      formatDateOnly(account.createdAt),
      300,
      y - 43,
      boldFont,
      10,
      COLORS.ink,
    );

    y -= 125;

    drawText(
      page,
      "Privacy note",
      48,
      y,
      boldFont,
      12,
      COLORS.ink,
    );

    y -= 19;

    y = drawWrappedText(
      page,
      "This export contains information associated with your Moodify account. Password hashes, session tokens, and other authentication secrets are intentionally excluded.",
      48,
      y,
      pageWidth - 96,
      regularFont,
      9,
      14,
      COLORS.muted,
    );

    /*
     * --------------------------------------------------
     * ACCOUNT
     * --------------------------------------------------
     */

    ensureSpace(180);

    y -= 25;

    y = drawSectionTitle(
      page,
      "Account",
      y,
      boldFont,
    );

    drawCard(
      page,
      42,
      y - 108,
      pageWidth - 84,
      108,
    );

    const accountRows = [
      ["Name", account.name],
      ["Email", account.email],
      ["Gender", account.gender ?? "-"],
      ["Date of birth", formatDateOnly(account.dateOfBirth)],
      ["Account created", formatDateOnly(account.createdAt)],
    ];

    let accountY = y - 25;

    for (const [label, value] of accountRows) {
      drawText(
        page,
        label,
        58,
        accountY,
        regularFont,
        8.5,
        COLORS.muted,
      );

      drawText(
        page,
        value,
        180,
        accountY,
        regularFont,
        9,
        COLORS.ink,
      );

      accountY -= 17;
    }

    y -= 135;

    /*
     * --------------------------------------------------
     * PREFERENCES
     * --------------------------------------------------
     */

    if (preference) {
      ensureSpace(190);

      y = drawSectionTitle(
        page,
        "Preferences",
        y,
        boldFont,
      );

      drawCard(
        page,
        42,
        y - 120,
        pageWidth - 84,
        120,
      );

      const preferenceRows = [
        ["Language", preference.language],
        [
          "Communication style",
          preference.communicationStyle,
        ],
        [
          "Support preference",
          preference.supportPreference,
        ],
        [
          "Journaling preference",
          preference.journalingPreference,
        ],
        [
          "Notifications",
          preference.notificationEnabled
            ? "Enabled"
            : "Disabled",
        ],
        [
          "Daily check-in time",
          preference.dailyCheckinTime ?? "-",
        ],
      ];

      let preferenceY = y - 22;

      for (const [label, value] of preferenceRows) {
        drawText(
          page,
          label,
          58,
          preferenceY,
          regularFont,
          8.5,
          COLORS.muted,
        );

        drawText(
          page,
          value,
          210,
          preferenceY,
          regularFont,
          9,
          COLORS.ink,
        );

        preferenceY -= 16;
      }

      y -= 145;
    }

    /*
     * --------------------------------------------------
     * CHECK-INS
     * --------------------------------------------------
     */

    ensureSpace(180);

    y = drawSectionTitle(
      page,
      `Check-ins (${checkins.length})`,
      y,
      boldFont,
    );

    if (checkins.length === 0) {
      drawText(
        page,
        "No check-ins recorded.",
        48,
        y,
        regularFont,
        9,
        COLORS.muted,
      );

      y -= 30;
    } else {
      for (const checkin of checkins) {
        ensureSpace(150);

        const emotions = checkin.emotions
          .map(
            (item) =>
              `${item.emotion.name} (${item.intensity}/5)`,
          )
          .join(", ");

        const contexts = checkin.contexts
          .map((item) => item.context.name)
          .join(", ");

        const height = 105;

        drawCard(
          page,
          42,
          y - height,
          pageWidth - 84,
          height,
        );

        let cardY = y - 20;

        drawText(
          page,
          formatDateOnly(checkin.checkinDate),
          58,
          cardY,
          boldFont,
          10,
          COLORS.ink,
        );

        cardY -= 18;

        drawText(
          page,
          "Emotions",
          58,
          cardY,
          boldFont,
          8,
          COLORS.primary,
        );

        cardY -= 13;

        cardY = drawWrappedText(
          page,
          emotions || "No emotion selected.",
          58,
          cardY,
          pageWidth - 116,
          regularFont,
          8.5,
          12,
          COLORS.ink,
        );

        cardY -= 2;

        if (contexts) {
          drawText(
            page,
            "Contexts",
            58,
            cardY,
            boldFont,
            8,
            COLORS.primary,
          );

          cardY -= 13;

          cardY = drawWrappedText(
            page,
            contexts,
            58,
            cardY,
            pageWidth - 116,
            regularFont,
            8.5,
            12,
            COLORS.ink,
          );
        }

        y -= height + 15;
      }
    }

    /*
     * --------------------------------------------------
     * EMOTION DESCRIPTIONS
     * --------------------------------------------------
     */

    if (emotionDescriptions.length > 0) {
      ensureSpace(150);

      y = drawSectionTitle(
        page,
        `Emotion Descriptions (${emotionDescriptions.length})`,
        y,
        boldFont,
      );

      for (const item of emotionDescriptions) {
        ensureSpace(120);

        const height = 90;

        drawCard(
          page,
          42,
          y - height,
          pageWidth - 84,
          height,
        );

        let cardY = y - 19;

        drawText(
          page,
          formatDate(item.createdAt),
          58,
          cardY,
          boldFont,
          9,
          COLORS.ink,
        );

        cardY -= 16;

        if (item.aiEmotion) {
          drawText(
            page,
            `AI interpretation: ${item.aiEmotion}`,
            58,
            cardY,
            boldFont,
            8.5,
            COLORS.primary,
          );

          cardY -= 14;
        }

        cardY = drawWrappedText(
          page,
          item.description,
          58,
          cardY,
          pageWidth - 116,
          regularFont,
          8.5,
          12,
          COLORS.ink,
        );

        y -= height + 15;
      }
    }

    /*
     * --------------------------------------------------
     * DIARY
     * --------------------------------------------------
     */

    ensureSpace(160);

    y = drawSectionTitle(
      page,
      `Diary Entries (${diaryEntries.length})`,
      y,
      boldFont,
    );

    if (diaryEntries.length === 0) {
      drawText(
        page,
        "No diary entries recorded.",
        48,
        y,
        regularFont,
        9,
        COLORS.muted,
      );

      y -= 30;
    } else {
      for (const entry of diaryEntries) {
        ensureSpace(140);

        const content = entry.content || "";

        const estimatedHeight = Math.min(
          170,
          Math.max(
            85,
            Math.ceil(content.length / 75) * 13 + 48,
          ),
        );

        const height = estimatedHeight;

        drawCard(
          page,
          42,
          y - height,
          pageWidth - 84,
          height,
        );

        let cardY = y - 19;

        drawText(
          page,
          formatDate(entry.createdAt),
          58,
          cardY,
          boldFont,
          9,
          COLORS.ink,
        );

        drawText(
          page,
          entry.entryType,
          420,
          cardY,
          regularFont,
          8,
          COLORS.muted,
        );

        cardY -= 20;

        drawWrappedText(
          page,
          content || "Empty diary entry.",
          58,
          cardY,
          pageWidth - 116,
          regularFont,
          8.5,
          13,
          COLORS.ink,
        );

        y -= height + 15;
      }
    }

    /*
     * --------------------------------------------------
     * AI ANALYSES
     * --------------------------------------------------
     */

    ensureSpace(170);

    y = drawSectionTitle(
      page,
      `AI Analyses (${analyses.length})`,
      y,
      boldFont,
    );

    if (analyses.length === 0) {
      drawText(
        page,
        "No AI analyses recorded.",
        48,
        y,
        regularFont,
        9,
        COLORS.muted,
      );

      y -= 30;
    } else {
      for (const analysis of analyses) {
        ensureSpace(180);

        const height = 145;

        drawCard(
          page,
          42,
          y - height,
          pageWidth - 84,
          height,
        );

        let cardY = y - 19;

        drawText(
          page,
          formatDate(analysis.createdAt),
          58,
          cardY,
          boldFont,
          9,
          COLORS.ink,
        );

        if (analysis.riskLevel) {
          drawText(
            page,
            `Risk: ${analysis.riskLevel}`,
            420,
            cardY,
            boldFont,
            8,
            COLORS.peach,
          );
        }

        cardY -= 19;

        if (analysis.stressScore !== null) {
          drawText(
            page,
            `Stress score: ${analysis.stressScore}/100`,
            58,
            cardY,
            regularFont,
            8.5,
            COLORS.primary,
          );

          cardY -= 15;
        }

        if (analysis.emotionalState) {
          drawText(
            page,
            `Emotional state: ${analysis.emotionalState}`,
            58,
            cardY,
            regularFont,
            8.5,
            COLORS.ink,
          );

          cardY -= 15;
        }

        if (analysis.summary) {
          drawText(
            page,
            "Summary",
            58,
            cardY,
            boldFont,
            8,
            COLORS.primary,
          );

          cardY -= 13;

          cardY = drawWrappedText(
            page,
            analysis.summary,
            58,
            cardY,
            pageWidth - 116,
            regularFont,
            8.2,
            12,
            COLORS.ink,
          );
        }

        y -= height + 15;
      }
    }

    /*
     * --------------------------------------------------
     * FINAL DISCLAIMER
     * --------------------------------------------------
     */

    ensureSpace(150);

    y -= 15;

    page.drawRectangle({
      x: 42,
      y: y - 95,
      width: pageWidth - 84,
      height: 95,
      color: COLORS.background,
      borderColor: COLORS.border,
      borderWidth: 0.7,
    });

    drawText(
      page,
      "About this export",
      58,
      y - 22,
      boldFont,
      10,
      COLORS.ink,
    );

    drawWrappedText(
      page,
      "Moodify's AI analysis is intended to help users reflect on their emotional experiences. It is not a medical diagnosis, professional mental health assessment, or substitute for professional care.",
      58,
      y - 40,
      pageWidth - 116,
      regularFont,
      8.5,
      13,
      COLORS.muted,
    );

    footer();

    const pdfBytes = await pdf.save();

    const filename = `Moodify_Data_Export_${
      new Date().toISOString().slice(0, 10)
    }.pdf`;

    const pdfBuffer = Buffer.from(pdfBytes);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(
      "GET /api/privacy/export error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate data export.",
      },
      { status: 500 },
    );
  }
}