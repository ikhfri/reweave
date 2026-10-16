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
export const dynamic = "force-dynamic";

// Reweave brand palette: porcelain, taupe, burnt peach, peach-fuzz, sage, slate-indigo.
const COLORS = {
  ink: rgb(0.29, 0.247, 0.208),       // #4A3F35
  muted: rgb(0.46, 0.42, 0.38),
  indigo: rgb(0.36, 0.42, 0.61),      // #5C6B9C
  coral: rgb(0.886, 0.447, 0.357),    // #E2725B
  peach: rgb(0.984, 0.769, 0.671),    // #FBC4AB
  sage: rgb(0.757, 0.835, 0.753),      // #C1D5C0
  porcelain: rgb(0.992, 0.984, 0.969),// #FDFBF7
  white: rgb(1, 1, 1),
  border: rgb(0.89, 0.86, 0.82),
  paleIndigo: rgb(0.94, 0.95, 0.98),
  palePeach: rgb(1, 0.95, 0.91),
  paleSage: rgb(0.94, 0.97, 0.93),
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_LIMIT = 58;

function formatDate(date: Date | null | undefined) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDateOnly(date: Date | null | undefined) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

function safeText(value: unknown, fallback = "-"): string {
  if (value === null || value === undefined || value === "") return fallback;
  // Standard PDF fonts do not support every Unicode glyph. Normalize common typography
  // to avoid encoding failures while preserving readable content.
  return String(value)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2022/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");
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
  page.drawText(safeText(text), { x, y, size, font, color });
}

function wrapLines(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = safeText(text, "").replace(/\r/g, "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !line) {
      // Break unusually long tokens instead of allowing them to spill beyond the card.
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && !line) {
        let part = "";
        for (const char of word) {
          const next = part + char;
          if (part && font.widthOfTextAtSize(next, size) > maxWidth) {
            lines.push(part);
            part = char;
          } else part = next;
        }
        line = part;
      } else line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  width: number,
  font: PDFFont,
  size = 9,
  lineHeight = 13,
  color = COLORS.ink,
  maxLines = Number.POSITIVE_INFINITY,
) {
  const lines = wrapLines(text, font, size, width).slice(0, maxLines);
  lines.forEach((line, index) => drawText(page, line, x, y - index * lineHeight, font, size, color));
  return y - lines.length * lineHeight;
}

function drawPill(page: PDFPage, label: string, x: number, y: number, font: PDFFont, color = COLORS.indigo) {
  const text = safeText(label).toUpperCase();
  const size = 7;
  const width = font.widthOfTextAtSize(text, size) + 16;
  page.drawRectangle({ x, y: y - 4, width, height: 17, color });
  drawText(page, text, x + 8, y + 1, font, size, COLORS.white);
  return width;
}

function drawSectionTitle(page: PDFPage, title: string, y: number, boldFont: PDFFont) {
  page.drawRectangle({ x: MARGIN, y: y - 4, width: 5, height: 19, color: COLORS.coral });
  drawText(page, title, MARGIN + 14, y, boldFont, 14, COLORS.ink);
  return y - 28;
}

function drawCard(page: PDFPage, x: number, y: number, width: number, height: number, fill = COLORS.white) {
  page.drawRectangle({
    x, y, width, height,
    color: fill,
    borderColor: COLORS.border,
    borderWidth: 0.65,
  });
  // Small brand accent, deliberately subtle rather than a heavy UI-like border.
  page.drawRectangle({ x, y: y + height - 3, width, height: 3, color: COLORS.peach });
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const [account, preference, checkins, diaryEntries, analyses, emotionDescriptions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true, gender: true, dateOfBirth: true, createdAt: true },
      }),
      prisma.userPreference.findUnique({
        where: { userId: user.id },
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
        where: { userId: user.id },
        orderBy: { checkinDate: "desc" },
        include: {
          emotions: {
            orderBy: { position: "asc" },
            include: { emotion: { select: { name: true, slug: true, category: true } } },
          },
          contexts: { include: { context: { select: { name: true, slug: true } } } },
        },
      }),
      prisma.diaryEntry.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, content: true, entryType: true, createdAt: true },
      }),
      prisma.aIAnalysis.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
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
      prisma.emotionDescription.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
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
      return NextResponse.json({ success: false, message: "User account not found." }, { status: 404 });
    }

    const pdf = await PDFDocument.create();
    const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
    let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - 52;

    function addPage() {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - 54;
      drawPageTop(page, regularFont, boldFont);
    }

    function drawPageTop(target: PDFPage, regular: PDFFont, bold: PDFFont) {
      target.drawRectangle({ x: 0, y: PAGE_HEIGHT - 8, width: PAGE_WIDTH, height: 8, color: COLORS.coral });
      drawText(target, "REWEAVE  /  PERSONAL WELLBEING ARCHIVE", MARGIN, PAGE_HEIGHT - 32, bold, 7.5, COLORS.indigo);
      target.drawLine({ start: { x: MARGIN, y: PAGE_HEIGHT - 42 }, end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - 42 }, thickness: 0.6, color: COLORS.border });
      void regular;
    }

    function ensureSpace(requiredHeight: number) {
      if (y - requiredHeight < BOTTOM_LIMIT) addPage();
    }

    function drawFooter() {
      const pages = pdf.getPages();
      pages.forEach((currentPage, index) => {
        currentPage.drawLine({
          start: { x: MARGIN, y: 38 },
          end: { x: PAGE_WIDTH - MARGIN, y: 38 },
          thickness: 0.6,
          color: COLORS.border,
        });
        drawText(currentPage, "Every feeling has a thread.", MARGIN, 23, regularFont, 8, COLORS.muted);
        drawText(currentPage, `${index + 1} / ${pages.length}`, PAGE_WIDTH - MARGIN - 28, 23, regularFont, 8, COLORS.indigo);
      });
    }

    // COVER — quiet editorial layout with generous space and a warm brand palette.
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 250, width: PAGE_WIDTH, height: 250, color: COLORS.indigo });
    page.drawRectangle({ x: PAGE_WIDTH - 142, y: PAGE_HEIGHT - 250, width: 142, height: 250, color: COLORS.coral });
    page.drawCircle({ x: PAGE_WIDTH - 92, y: PAGE_HEIGHT - 106, size: 43, color: COLORS.peach, opacity: 0.9 });
    page.drawCircle({ x: PAGE_WIDTH - 58, y: PAGE_HEIGHT - 154, size: 23, color: COLORS.sage, opacity: 0.95 });
    drawText(page, "REWEAVE", MARGIN + 6, PAGE_HEIGHT - 76, boldFont, 10, COLORS.peach);
    drawText(page, "Personal data", MARGIN + 6, PAGE_HEIGHT - 125, boldFont, 30, COLORS.white);
    drawText(page, "export", MARGIN + 6, PAGE_HEIGHT - 161, boldFont, 30, COLORS.white);
    drawWrappedText(page, "A thoughtful copy of the information you have saved in your Reweave account.", MARGIN + 7, PAGE_HEIGHT - 194, 310, regularFont, 10, 15, COLORS.white);

    y = PAGE_HEIGHT - 300;
    drawText(page, safeText(account.name, "Reweave member"), MARGIN + 6, y, boldFont, 19, COLORS.ink);
    y -= 22;
    drawText(page, safeText(account.email), MARGIN + 6, y, regularFont, 9.5, COLORS.muted);
    y -= 34;

    const infoY = y - 78;
    drawCard(page, MARGIN, infoY, CONTENT_WIDTH, 78, COLORS.porcelain);
    drawText(page, "EXPORT GENERATED", MARGIN + 16, y - 21, boldFont, 7, COLORS.indigo);
    drawText(page, formatDate(new Date()), MARGIN + 16, y - 40, boldFont, 10, COLORS.ink);
    drawText(page, "ACCOUNT CREATED", MARGIN + 285, y - 21, boldFont, 7, COLORS.indigo);
    drawText(page, formatDateOnly(account.createdAt), MARGIN + 285, y - 40, boldFont, 10, COLORS.ink);
    y = infoY - 38;

    drawText(page, "A note on privacy", MARGIN + 6, y, boldFont, 11, COLORS.ink);
    y -= 18;
    y = drawWrappedText(
      page,
      "This export contains information associated with your Reweave account. Password hashes, session tokens, and other authentication secrets are intentionally excluded.",
      MARGIN + 6, y, CONTENT_WIDTH - 12, regularFont, 9, 14, COLORS.muted,
    ) - 20;

    // ACCOUNT
    ensureSpace(155);
    y = drawSectionTitle(page, "Account", y, boldFont);
    const accountRows: [string, string][] = [
      ["Name", safeText(account.name)],
      ["Email", safeText(account.email)],
      ["Gender", safeText(account.gender)],
      ["Date of birth", formatDateOnly(account.dateOfBirth)],
      ["Account created", formatDateOnly(account.createdAt)],
    ];
    const accountCardHeight = 105;
    drawCard(page, MARGIN, y - accountCardHeight, CONTENT_WIDTH, accountCardHeight);
    let rowY = y - 22;
    for (const [label, value] of accountRows) {
      drawText(page, label, MARGIN + 16, rowY, regularFont, 8.5, COLORS.muted);
      drawText(page, value, MARGIN + 145, rowY, regularFont, 9, COLORS.ink);
      rowY -= 17;
    }
    y -= accountCardHeight + 24;

    // PREFERENCES
    if (preference) {
      ensureSpace(155);
      y = drawSectionTitle(page, "Your preferences", y, boldFont);
      const preferenceRows: [string, string][] = [
        ["Language", safeText(preference.language)],
        ["Communication style", safeText(preference.communicationStyle)],
        ["Support preference", safeText(preference.supportPreference)],
        ["Journaling preference", safeText(preference.journalingPreference)],
        ["Notifications", preference.notificationEnabled ? "Enabled" : "Disabled"],
        ["Daily check-in time", safeText(preference.dailyCheckinTime)],
      ];
      const cardHeight = 118;
      drawCard(page, MARGIN, y - cardHeight, CONTENT_WIDTH, cardHeight, COLORS.paleIndigo);
      let prefY = y - 21;
      for (const [label, value] of preferenceRows) {
        drawText(page, label, MARGIN + 16, prefY, regularFont, 8.3, COLORS.muted);
        drawText(page, value, MARGIN + 190, prefY, regularFont, 8.8, COLORS.ink);
        prefY -= 16;
      }
      y -= cardHeight + 24;
    }

    // CHECK-INS
    ensureSpace(100);
    y = drawSectionTitle(page, `Check-ins (${checkins.length})`, y, boldFont);
    if (checkins.length === 0) {
      y = drawWrappedText(page, "No check-ins recorded.", MARGIN + 6, y, CONTENT_WIDTH - 12, regularFont, 9, 13, COLORS.muted) - 18;
    } else {
      for (const checkin of checkins) {
        const emotions = checkin.emotions.map((item) => `${item.emotion.name} (${item.intensity}/5)`).join(", ") || "No emotion selected.";
        const contexts = checkin.contexts.map((item) => item.context.name).join(", ");
        const emotionLines = wrapLines(emotions, regularFont, 8.5, CONTENT_WIDTH - 34).length;
        const contextLines = contexts ? wrapLines(contexts, regularFont, 8.5, CONTENT_WIDTH - 34).length : 0;
        const cardHeight = Math.max(84, 48 + emotionLines * 11 + (contexts ? 16 + contextLines * 11 : 0));
        ensureSpace(cardHeight + 12);
        drawCard(page, MARGIN, y - cardHeight, CONTENT_WIDTH, cardHeight);
        let cardY = y - 21;
        drawText(page, formatDateOnly(checkin.checkinDate), MARGIN + 15, cardY, boldFont, 9.5, COLORS.ink);
        cardY -= 18;
        drawText(page, "EMOTIONS", MARGIN + 15, cardY, boldFont, 7, COLORS.indigo);
        cardY -= 12;
        cardY = drawWrappedText(page, emotions, MARGIN + 15, cardY, CONTENT_WIDTH - 30, regularFont, 8.5, 11, COLORS.ink);
        if (contexts) {
          cardY -= 3;
          drawText(page, "CONTEXTS", MARGIN + 15, cardY, boldFont, 7, COLORS.coral);
          cardY -= 12;
          drawWrappedText(page, contexts, MARGIN + 15, cardY, CONTENT_WIDTH - 30, regularFont, 8.5, 11, COLORS.ink);
        }
        y -= cardHeight + 12;
      }
      y -= 6;
    }

    // EMOTION DESCRIPTIONS
    if (emotionDescriptions.length > 0) {
      ensureSpace(100);
      y = drawSectionTitle(page, `Emotion reflections (${emotionDescriptions.length})`, y, boldFont);
      for (const item of emotionDescriptions) {
        const body = safeText(item.description, "No description provided.");
        const lines = wrapLines(body, regularFont, 8.5, CONTENT_WIDTH - 30).length;
        const cardHeight = Math.max(76, 45 + lines * 11 + (item.aiEmotion ? 13 : 0));
        ensureSpace(cardHeight + 12);
        drawCard(page, MARGIN, y - cardHeight, CONTENT_WIDTH, cardHeight, COLORS.paleSage);
        let cardY = y - 20;
        drawText(page, formatDate(item.createdAt), MARGIN + 15, cardY, boldFont, 8.8, COLORS.ink);
        cardY -= 15;
        if (item.aiEmotion) {
          cardY = drawWrappedText(page, `AI reflection: ${item.aiEmotion}`, MARGIN + 15, cardY, CONTENT_WIDTH - 30, boldFont, 8.2, 11, COLORS.indigo);
          cardY -= 2;
        }
        drawWrappedText(page, body, MARGIN + 15, cardY, CONTENT_WIDTH - 30, regularFont, 8.5, 11, COLORS.ink);
        y -= cardHeight + 12;
      }
      y -= 6;
    }

    // DIARY ENTRIES
    ensureSpace(100);
    y = drawSectionTitle(page, `Diary entries (${diaryEntries.length})`, y, boldFont);
    if (diaryEntries.length === 0) {
      y = drawWrappedText(page, "No diary entries recorded.", MARGIN + 6, y, CONTENT_WIDTH - 12, regularFont, 9, 13, COLORS.muted) - 18;
    } else {
      for (const entry of diaryEntries) {
        const content = safeText(entry.content, "Empty diary entry.");
        const lines = wrapLines(content, regularFont, 8.5, CONTENT_WIDTH - 30).length;
        const shownLines = Math.min(lines, 18);
        const cardHeight = Math.max(78, 43 + shownLines * 11);
        ensureSpace(cardHeight + 12);
        drawCard(page, MARGIN, y - cardHeight, CONTENT_WIDTH, cardHeight);
        drawText(page, formatDate(entry.createdAt), MARGIN + 15, y - 20, boldFont, 8.8, COLORS.ink);
        drawPill(page, safeText(entry.entryType, "DIARY"), PAGE_WIDTH - MARGIN - 90, y - 20, boldFont, COLORS.indigo);
        const diaryLines = wrapLines(content, regularFont, 8.5, CONTENT_WIDTH - 30).slice(0, shownLines);
        diaryLines.forEach((line, index) => drawText(page, line, MARGIN + 15, y - 39 - index * 11, regularFont, 8.5, COLORS.ink));
        if (lines > shownLines) {
          drawText(page, "[Entry shortened in this export]", MARGIN + 15, y - 39 - shownLines * 11, regularFont, 7.5, COLORS.muted);
        }
        y -= cardHeight + 12;
      }
      y -= 6;
    }

    // AI ANALYSES
    ensureSpace(100);
    y = drawSectionTitle(page, `AI reflections (${analyses.length})`, y, boldFont);
    if (analyses.length === 0) {
      y = drawWrappedText(page, "No AI analyses recorded.", MARGIN + 6, y, CONTENT_WIDTH - 12, regularFont, 9, 13, COLORS.muted) - 18;
    } else {
      for (const analysis of analyses) {
        const summary = safeText(analysis.summary, "No summary available.");
        const validation = safeText(analysis.validationMessage, "");
        const emotionalState = safeText(analysis.emotionalState, "");
        const summaryLines = wrapLines(summary, regularFont, 8.3, CONTENT_WIDTH - 30).length;
        const validationLines = validation ? wrapLines(validation, regularFont, 8.3, CONTENT_WIDTH - 30).length : 0;
        const emotionalLines = emotionalState ? wrapLines(emotionalState, regularFont, 8.3, CONTENT_WIDTH - 30).length : 0;
        const cardHeight = Math.max(104, 59 + Math.min(summaryLines, 5) * 10 + Math.min(validationLines, 3) * 10 + Math.min(emotionalLines, 2) * 10);
        ensureSpace(cardHeight + 12);
        drawCard(page, MARGIN, y - cardHeight, CONTENT_WIDTH, cardHeight, COLORS.palePeach);
        let cardY = y - 20;
        drawText(page, formatDate(analysis.createdAt), MARGIN + 15, cardY, boldFont, 8.8, COLORS.ink);
        if (analysis.riskLevel) drawPill(page, `Risk ${analysis.riskLevel}`, PAGE_WIDTH - MARGIN - 100, cardY - 1, boldFont, analysis.riskLevel === "HIGH" ? COLORS.coral : COLORS.indigo);
        cardY -= 17;
        if (analysis.emotionalState) {
          drawText(page, "EMOTIONAL STATE", MARGIN + 15, cardY, boldFont, 7, COLORS.indigo);
          cardY -= 11;
          cardY = drawWrappedText(page, emotionalState, MARGIN + 15, cardY, CONTENT_WIDTH - 30, regularFont, 8.3, 10, COLORS.ink, 2) - 3;
        }
        if (validation) {
          drawText(page, "VALIDATION", MARGIN + 15, cardY, boldFont, 7, COLORS.coral);
          cardY -= 11;
          cardY = drawWrappedText(page, validation, MARGIN + 15, cardY, CONTENT_WIDTH - 30, regularFont, 8.3, 10, COLORS.ink, 3) - 3;
        }
        drawText(page, "REFLECTION", MARGIN + 15, cardY, boldFont, 7, COLORS.indigo);
        cardY -= 11;
        drawWrappedText(page, summary, MARGIN + 15, cardY, CONTENT_WIDTH - 30, regularFont, 8.3, 10, COLORS.ink, 5);
        if (analysis.stressScore !== null) {
          drawText(page, `Wellbeing indicator: ${analysis.stressScore}/100`, MARGIN + 15, y - cardHeight + 13, regularFont, 7.5, COLORS.muted);
        }
        y -= cardHeight + 12;
      }
    }

    // Gentle closing note.
    ensureSpace(105);
    y -= 6;
    page.drawRectangle({ x: MARGIN, y: y - 76, width: CONTENT_WIDTH, height: 76, color: COLORS.indigo });
    page.drawRectangle({ x: MARGIN, y: y - 76, width: 5, height: 76, color: COLORS.coral });
    drawText(page, "A gentle reminder", MARGIN + 16, y - 22, boldFont, 10, COLORS.peach);
    drawWrappedText(
      page,
      "Reweave's reflections are intended to support personal understanding and wellbeing. They are not a medical diagnosis or a substitute for professional care. Take what feels useful, leave what does not, and move at your own pace.",
      MARGIN + 16, y - 40, CONTENT_WIDTH - 32, regularFont, 8.2, 11, COLORS.white,
    );

    drawFooter();
    const pdfBytes = await pdf.save();
    const filename = `Reweave_Data_Export_${new Date().toISOString().slice(0, 10)}.pdf`;
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/privacy/export error:", error);
    return NextResponse.json({ success: false, message: "Failed to generate data export." }, { status: 500 });
  }
}
