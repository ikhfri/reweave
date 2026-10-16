import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidLocale, type Locale } from "@/i18n/config";
import AIAnalysisResult from "@/components/ai-analysis-result";

type Props = {
  params: Promise<{
    locale: string;
    checkinId: string;
  }>;
};

export default async function CheckInResultPage({ params }: Props) {
  const { locale, checkinId } = await params;

  // --------------------------------------------------
  // Validate locale
  // --------------------------------------------------
  if (!isValidLocale(locale)) {
    redirect("/id/dashboard");
  }

  // --------------------------------------------------
  // Authentication
  // --------------------------------------------------
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // --------------------------------------------------
  // Onboarding
  // --------------------------------------------------
  if (!user.onboardingCompleted) {
    redirect(`/${locale}/onboarding`);
  }

  // --------------------------------------------------
  // Get check-in
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

  // --------------------------------------------------
  // Check-in not found / doesn't belong to user
  // --------------------------------------------------
  if (!checkin) {
    redirect(`/${locale}/moodlog`);
  }

  // --------------------------------------------------
  // Get latest AI analysis for this check-in
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
  // AI analysis isn't available yet
  // --------------------------------------------------
  if (!analysis) {
    const isEnglish = locale === "en";

    return (
      <main className="min-h-screen bg-[#FDFBF7] px-5 py-16 text-[#4A3F35] sm:px-7 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="border-y border-[#C1D5C0]/60 py-10 sm:py-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
              {isEnglish ? "A little pause" : "Sedikit menunggu"}
            </p>

            <h1 className="mt-5 text-[30px] font-semibold leading-[1.15] tracking-[-0.04em] sm:text-[38px]">
              {isEnglish
                ? "Your reflection isn't ready yet."
                : "Refleksimu belum tersedia."}
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-8 text-[#4A3F35]/55">
              {isEnglish
                ? "Your check-in has been saved, but your reflection hasn't been generated yet."
                : "Check-in kamu sudah tersimpan. Namun, refleksi untukmu belum berhasil dibuat."}
            </p>

            <p className="mt-3 max-w-xl text-[13px] leading-7 text-[#4A3F35]/40">
              {isEnglish
                ? "You can try again later when the analysis becomes available."
                : "Kamu bisa mencoba lagi nanti ketika analisis sudah tersedia."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`/${locale}/moodlog`}
                className="inline-flex items-center rounded-full bg-[#4A3F35] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#5C6B9C]"
              >
                {isEnglish ? "Back to check-in" : "Kembali ke check-in"}
              </a>

              <a
                href={`/${locale}/dashboard`}
                className="inline-flex items-center rounded-full border border-[#4A3F35]/15 px-5 py-2.5 text-xs font-semibold text-[#4A3F35]/70 transition hover:border-[#4A3F35]/30 hover:text-[#4A3F35]"
              >
                {isEnglish ? "Go to dashboard" : "Ke dashboard"}
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // Render AI analysis result
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