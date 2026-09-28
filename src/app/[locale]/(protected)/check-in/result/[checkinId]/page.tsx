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
  // AI analysis doesn't exist yet
  // --------------------------------------------------

  if (!analysis) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] px-5 py-16 text-[#4A3F35] sm:px-7 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="border-y border-[#C1D5C0]/60 py-10 sm:py-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
              {locale === "id"
                ? "Sedikit menunggu"
                : "A little pause"}
            </p>

            <h1 className="mt-5 text-[30px] font-semibold leading-[1.15] tracking-[-0.04em] sm:text-[38px]">
              {locale === "id"
                ? "Refleksimu belum tersedia."
                : "Your reflection isn't ready yet."}
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-8 text-[#4A3F35]/55">
              {locale === "id"
                ? "Check-in kamu sudah tersimpan. Namun, refleksi untukmu belum berhasil dibuat."
                : "Your check-in has been saved, but your reflection hasn't been generated yet."}
            </p>

            <p className="mt-3 max-w-xl text-[13px] leading-7 text-[#4A3F35]/40">
              {locale === "id"
                ? "Kamu bisa mencoba lagi nanti ketika analisis sudah tersedia."
                : "You can try again later when the analysis becomes available."}
            </p>
          </div>
        </div>
      </main>
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