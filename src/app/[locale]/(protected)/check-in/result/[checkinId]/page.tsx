import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isValidLocale,
  type Locale,
} from "@/i18n/config";

import AIAnalysisResult from "@/components/ai-analysis-result";

type Props = {
  params: Promise<{
    locale: string;
    checkinId: string;
  }>;
};

export default async function CheckInResultPage({
  params,
}: Props) {
  const { locale, checkinId } = await params;

  // Validate locale
  if (!isValidLocale(locale)) {
    redirect("/id/dashboard");
  }

  // Authentication
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Onboarding
  if (!user.onboardingCompleted) {
    redirect(`/${locale}/onboarding`);
  }

  // --------------------------------------------------
  // Get the check-in first
  // --------------------------------------------------

  const checkin = await prisma.dailyCheckin.findFirst({
    where: {
      id: checkinId,
      userId: user.id,
    },
    include: {
      emotions: {
        select: {
          id: true,
          intensity: true,
          note: true,
          position: true,
          emotion: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },

      contexts: {
        select: {
          id: true,
          context: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },

      diaryEntries: {
        select: {
          id: true,
          content: true,
          entryType: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  // Check-in doesn't belong to this user
  if (!checkin) {
    redirect(`/${locale}/check-in`);
  }

  // --------------------------------------------------
  // Get latest AI analysis
  // --------------------------------------------------

  const analysis = await prisma.aIAnalysis.findFirst({
    where: {
      userId: user.id,
      checkinId: checkin.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // --------------------------------------------------
  // IMPORTANT:
  // Don't redirect to /check-in when AI analysis
  // doesn't exist.
  // --------------------------------------------------

  if (!analysis) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-amber-900">
            {locale === "id"
              ? "Analisis AI belum tersedia"
              : "AI analysis is not available yet"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            {locale === "id"
              ? "Check-in kamu sudah tersimpan, tetapi analisis AI belum berhasil dibuat."
              : "Your check-in has been saved, but the AI analysis has not been generated yet."}
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-700">
            {locale === "id"
              ? "Kamu bisa kembali ke halaman check-in dan mencoba analisis lagi."
              : "You can return to the check-in page and try the analysis again."}
          </p>

          <a
            href={`/${locale}/check-in`}
            className="
              mt-5 inline-flex h-10 items-center
              justify-center rounded-xl
              bg-indigo-600 px-4
              text-sm font-semibold text-white
              transition hover:bg-indigo-700
            "
          >
            {locale === "id"
              ? "Kembali ke Check-in"
              : "Back to Check-in"}
          </a>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Render AI result
  // --------------------------------------------------

  return (
    <AIAnalysisResult
      locale={locale as Locale}
      analysis={{
        ...analysis,
        checkin,
      }}
    />
  );
}