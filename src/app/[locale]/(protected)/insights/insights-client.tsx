"use client";

import { useEffect, useMemo, useState } from "react";

import type { Locale } from "@/i18n/config";

type EmotionSummary = {

  name: string;

  slug: string;

  category: string;

  count: number;

  totalIntensity: number;

  averageIntensity: number;

};

type DailyTrend = {

  date: string;

  checkinCount: number;

  diaryCount: number;

  averageStress: number | null;

  dominantEmotion: string | null;

};

type WeeklySummary = {

  totalCheckins: number;

  totalDiaries: number;

  totalAnalyses: number;

  dominantEmotion: EmotionSummary | null;

  averageStress: number | null;

  sentiment: {

    POSITIVE: number;

    NEUTRAL: number;

    NEGATIVE: number;

  };

  commonContexts: Array<{

    name: string;

    slug: string;

    count: number;

  }>;

  possibleTriggers: Array<{

    name: string;

    count: number;

  }>;

  dailyTrend: DailyTrend[];

  activity: {

    totalStarted: number;

    totalCompleted: number;

    completionRate: number;

    averageRating: number | null;

    mostUsed: {

      id: string;

      title: string;

      count: number;

    } | null;

  };

};

type WeeklyData = {

  period: {

    start: string;

    end: string;

  };

  summary: WeeklySummary;

};

type Props = {

  locale: Locale;

  userName: string;

};

type WeeklyAI = {

  headline: string;

  summary: string;

  highlights: string[];

  reflectionPrompt: string;

  gentleSuggestion: string;

};

/* =========================================================*

*   CUSTOM MOODIFY ICONS*

*========================================================= */

function ActivityIcon({

  size = 16,

  className = "",

}: {

  size?: number;

  className?: string;

}) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 24 24"

      fill="none"

      className={className}

      aria-hidden="true"

    >

      <path

        d="M4 13.5H7L9.2 7L13 17L15.5 10.5L17 13.5H20"

        stroke="currentColor"

        strokeWidth="1.7"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

    </svg>

  );

}

function ChartIcon({

  size = 16,

  className = "",

}: {

  size?: number;

  className?: string;

}) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 24 24"

      fill="none"

      className={className}

      aria-hidden="true"

    >

      <path

        d="M5 20V10M12 20V5M19 20V8"

        stroke="currentColor"

        strokeWidth="1.7"

        strokeLinecap="round"

      />

      <path

        d="M3.5 20H20.5"

        stroke="currentColor"

        strokeWidth="1.7"

        strokeLinecap="round"

      />

    </svg>

  );

}

function BookIcon({

  size = 16,

  className = "",

}: {

  size?: number;

  className?: string;

}) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 24 24"

      fill="none"

      className={className}

      aria-hidden="true"

    >

      <path

        d="M5.5 4.5H9.2C10.7 4.5 12 5.7 12 7.2V19C12 17.7 10.9 16.7 9.5 16.7H5.5C4.7 16.7 4 16 4 15.2V6C4 5.2 4.7 4.5 5.5 4.5Z"

        stroke="currentColor"

        strokeWidth="1.6"

        strokeLinejoin="round"

      />

      <path

        d="M18.5 4.5H14.8C13.3 4.5 12 5.7 12 7.2V19C12 17.7 13.1 16.7 14.5 16.7H18.5C19.3 16.7 20 16 20 15.2V6C20 5.2 19.3 4.5 18.5 4.5Z"

        stroke="currentColor"

        strokeWidth="1.6"

        strokeLinejoin="round"

      />

    </svg>

  );

}

function CalendarIcon({

  size = 16,

  className = "",

}: {

  size?: number;

  className?: string;

}) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 24 24"

      fill="none"

      className={className}

      aria-hidden="true"

    >

      <rect

        x="3.5"

        y="5"

        width="17"

        height="15"

        rx="2.5"

        stroke="currentColor"

        strokeWidth="1.6"

      />

      <path

        d="M7.5 3.5V7M16.5 3.5V7M3.5 9.5H20.5"

        stroke="currentColor"

        strokeWidth="1.6"

        strokeLinecap="round"

      />

    </svg>

  );

}

function TrendUpIcon({

  size = 16,

  className = "",

}: {

  size?: number;

  className?: string;

}) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 24 24"

      fill="none"

      className={className}

      aria-hidden="true"

    >

      <path

        d="M4 16L10 10L14 14L20 7"

        stroke="currentColor"

        strokeWidth="1.8"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

      <path

        d="M15 7H20V12"

        stroke="currentColor"

        strokeWidth="1.8"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

    </svg>

  );

}

function TrendDownIcon({

  size = 16,

  className = "",

}: {

  size?: number;

  className?: string;

}) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 24 24"

      fill="none"

      className={className}

      aria-hidden="true"

    >

      <path

        d="M4 8L10 14L14 10L20 17"

        stroke="currentColor"

        strokeWidth="1.8"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

      <path

        d="M15 17H20V12"

        stroke="currentColor"

        strokeWidth="1.8"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

    </svg>

  );

}

function LoadingSpinner({

  size = 18,

  className = "",

}: {

  size?: number;

  className?: string;

}) {

  return (

    <span

      aria-hidden="true"

      className={`inline-block animate-spin rounded-full border-2 border-current/20 border-t-current ${className}`}

      style={{

        width: size,

        height: size,

      }}

    />

  );

}

/* =========================================================*

*   HELPERS*

*========================================================= */

function formatNumber(value: number) {

  return new Intl.NumberFormat(

    "en-US",

  ).format(value);

}

function getDayLabel(

  date: string,

  locale: Locale,

) {

  return new Intl.DateTimeFormat(

    locale === "id"

      ? "id-ID"

      : "en-US",

    {

      weekday: "short",

    },

  ).format(

    new Date(`${date}T00:00:00`),

  );

}

function getDateLabel(

  date: string,

  locale: Locale,

) {

  return new Intl.DateTimeFormat(

    locale === "id"

      ? "id-ID"

      : "en-US",

    {

      day: "numeric",

      month: "short",

    },

  ).format(

    new Date(`${date}T00:00:00`),

  );

}

export default function InsightsClient({

  locale,

  userName,

}: Props) {

  const isId = locale === "id";

  const [data, setData] =

    useState<WeeklyData | null>(null);

  const [loading, setLoading] =

    useState(true);

  const [error, setError] =

    useState("");

  const [weeklyAI, setWeeklyAI] =

    useState<WeeklyAI | null>(null);

  const [loadingAI, setLoadingAI] = useState(false);

  const [weeklyAIStale, setWeeklyAIStale] = useState(false);

  const [weeklyAIError, setWeeklyAIError] = useState("");


  async function handleRefreshWeeklyAI() {
    if (loadingAI) return;

    try {
      setLoadingAI(true);
      setWeeklyAIError("");

      const response = await fetch("/api/ai/weekly-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: locale === "id" ? "id" : "en",
          regenerate: true,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.summary) {
        throw new Error(
          result.error ||
            (isId ? "Gagal memperbarui insight." : "Failed to refresh insight."),
        );
      }

      setWeeklyAI(result.summary);
      setWeeklyAIStale(false);
    } catch (err) {
      console.error("[Insights:refresh-weekly-ai]", err);
      setWeeklyAIError(
        err instanceof Error
          ? err.message
          : isId
            ? "Gagal memperbarui insight."
            : "Failed to refresh insight.",
      );
    } finally {
      setLoadingAI(false);
    }
  }

  useEffect(() => {

    let cancelled = false;

    async function fetchInsights() {

      try {

        setLoading(true);

        setError("");

        const response = await fetch(

          "/api/insights/weekly",

          {

            method: "GET",

            cache: "no-store",

          },

        );

        const result =

          await response.json();

        if (!response.ok) {

          throw new Error(

            result.error ||

              (isId

                ? "Gagal memuat insights."

                : "Failed to load insights."),

          );

        }

        if (cancelled) {

          return;

        }

        setData(result);

        setLoadingAI(true);

        try {

          const aiResponse =

            await fetch(

              "/api/ai/weekly-summary",

              {

                method: "POST",

                headers: {

                  "Content-Type":

                    "application/json",

                },

                body: JSON.stringify({

                  language:

                    locale === "id"

                      ? "id"

                      : "en",

                }),

              },

            );

          const aiResult =

            await aiResponse.json();

          if (

            !cancelled &&

            aiResponse.ok &&

            aiResult.summary

          ) {

            setWeeklyAI(aiResult.summary);
            setWeeklyAIStale(Boolean(aiResult.stale));

          }

        } catch (aiError) {

          console.error(

            "Weekly AI error:",

            aiError,

          );

        } finally {

          if (!cancelled) {

            setLoadingAI(false);

          }

        }

      } catch (err) {

        console.error(

          "[Insights]",

          err,

        );

        if (!cancelled) {

          setError(

            err instanceof Error

              ? err.message

              : isId

                ? "Gagal memuat insights."

                : "Failed to load insights.",

          );

        }

      } finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    }

    void fetchInsights();

    return () => {

      cancelled = true;

    };

  }, [isId, locale]);

  const weekLabel = useMemo(() => {

    if (!data) {

      return "";

    }

    const start = new Date(

      data.period.start,

    );

    const end = new Date(

      data.period.end,

    );

    const formatter =

      new Intl.DateTimeFormat(

        isId ? "id-ID" : "en-US",

        {

          day: "numeric",

          month: "short",

        },

      );

    return `${formatter.format(start)} – ${formatter.format(end)}`;

  }, [data, isId]);

  const stressTrend = useMemo(() => {

    if (!data) {

      return "stable";

    }

    const values =

      data.summary.dailyTrend

        .map(

          (item) =>

            item.averageStress,

        )

        .filter(

          (

            value,

          ): value is number =>

            typeof value ===

            "number",

        );

    if (values.length < 2) {

      return "stable";

    }

    const first = values[0];

    const last =

      values[values.length - 1];

    if (last > first + 8) {

      return "up";

    }

    if (last < first - 8) {

      return "down";

    }

    return "stable";

  }, [data]);

  const totalSentiment = useMemo(() => {

    if (!data) {

      return 0;

    }

    return (

      data.summary.sentiment

        .POSITIVE +

      data.summary.sentiment

        .NEUTRAL +

      data.summary.sentiment

        .NEGATIVE

    );

  }, [data]);

  const sentimentPercentages =

    useMemo(() => {

      if (

        !data ||

        totalSentiment === 0

      ) {

        return {

          positive: 0,

          neutral: 0,

          negative: 0,

        };

      }

      return {

        positive: Math.round(

          (data.summary.sentiment

            .POSITIVE /

            totalSentiment) *

            100,

        ),

        neutral: Math.round(

          (data.summary.sentiment

            .NEUTRAL /

            totalSentiment) *

            100,

        ),

        negative: Math.round(

          (data.summary.sentiment

            .NEGATIVE /

            totalSentiment) *

            100,

        ),

      };

    }, [data, totalSentiment]);

  const highestStress = useMemo(() => {

    if (!data) {

      return null;

    }

    return data.summary.dailyTrend.reduce<DailyTrend | null>(

      (highest, current) => {

        if (

          current.averageStress ===

          null

        ) {

          return highest;

        }

        if (

          !highest ||

          highest.averageStress === null

        ) {

          return current;

        }

        return current.averageStress >

          highest.averageStress

          ? current

          : highest;

      },

      null,

    );

  }, [data]);

  const activeDays = useMemo(() => {

    if (!data) {

      return 0;

    }

    return data.summary.dailyTrend.filter(

      (day) =>

        day.checkinCount > 0 ||

        day.diaryCount > 0,

    ).length;

  }, [data]);

  if (loading) {

    return (

      <main className="min-h-screen bg-[#FDFBF7] px-4 py-8 text-[#4A3F35] md:px-8">

        <div className="mx-auto flex min-h-[600px] max-w-6xl items-center justify-center">

          <div className="flex flex-col items-center text-center">

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FBC4AB]/35">

              <LoadingSpinner

                size={20}

                className="text-[#5C6B9C]"

              />

            </div>

            <p className="text-sm font-medium text-[#4A3F35]">

              {isId

                ? "Menyusun perjalanan minggumu..."

                : "Putting your week together..."}

            </p>

            <p className="mt-1 text-xs text-[#4A3F35]/50">

              {isId

                ? "Sebentar, kita lihat polanya."

                : "Just a moment while we look at the patterns."}

            </p>

          </div>

        </div>

      </main>

    );

  }

  if (error || !data) {

    return (

      <main className="min-h-screen bg-[#FDFBF7] px-4 py-8 text-[#4A3F35] md:px-8">

        <div className="mx-auto max-w-6xl">

          <div className="rounded-2xl border border-[#E2725B]/20 bg-[#FBC4AB]/20 p-6">

            <p className="text-sm font-medium text-[#4A3F35]">

              {error ||

                (isId

                  ? "Data insights belum tersedia."

                  : "Insights data is not available.")}

            </p>

            <p className="mt-1 text-sm leading-6 text-[#4A3F35]/60">

              {isId

                ? "Coba kembali setelah kamu memiliki beberapa check-in atau diary."

                : "Try again after you have a few check-ins or diary entries."}

            </p>

          </div>

        </div>

      </main>

    );

  }

  const { summary } = data;

  return (

    <main className="min-h-screen bg-[#FDFBF7] px-4 py-6 text-[#4A3F35] md:px-8 md:py-10">

      <div className="mx-auto max-w-6xl">

        {/* INTRO */}

        <header className="mb-10">

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

            <div className="max-w-2xl">

              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">

                {isId

                  ? "Perjalanan emosional"

                  : "Emotional journey"}

              </p>

              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#4A3F35] md:text-4xl">

                {isId

                  ? `Minggumu bersama dirimu, ${userName}`

                  : `A look back at your week, ${userName}`}

              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#4A3F35]/60 md:text-[15px]">

                {isId

                  ? "Bukan untuk menilai bagaimana perasaanmu, tapi untuk membantu kamu melihat apa yang mungkin sedang terjadi."

                  : "Not to judge how you felt, but to help you notice what may have been happening beneath the surface."}

              </p>

            </div>

            <div className="flex w-fit items-center gap-2 border-b border-[#4A3F35]/15 pb-2 text-sm text-[#4A3F35]/65">

              <CalendarIcon

                size={16}

                className="text-[#5C6B9C]"

              />

              <span>{weekLabel}</span>

            </div>

          </div>

        </header>

        {/* WEEK IN NUMBERS */}

        <section className="mb-12">

          <div className="mb-5 flex items-end justify-between gap-4">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5C6B9C]">

                {isId

                  ? "Sekilas"

                  : "At a glance"}

              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#4A3F35]">

                {isId

                  ? "Jejak minggu ini"

                  : "Your week in a few numbers"}

              </h2>

            </div>

            <p className="hidden text-xs text-[#4A3F35]/45 sm:block">

              {activeDays} / 7{" "}

              {isId

                ? "hari aktif"

                : "active days"}

            </p>

          </div>

          <div className="grid border-y border-[#4A3F35]/10 md:grid-cols-3">

            <div className="border-b border-[#4A3F35]/10 py-5 md:border-b-0 md:border-r md:pr-8">

              <div className="flex items-center gap-3">

                <ActivityIcon

                  size={16}

                  className="text-[#5C6B9C]"

                />

                <span className="text-xs uppercase tracking-[0.12em] text-[#4A3F35]/45">

                  {isId

                    ? "Check-in"

                    : "Check-ins"}

                </span>

              </div>

              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#4A3F35]">

                {formatNumber(

                  summary.totalCheckins,

                )}

              </p>

              <p className="mt-1 text-xs text-[#4A3F35]/45">

                {isId

                  ? "momen kamu berhenti sejenak"

                  : "moments you paused for yourself"}

              </p>

            </div>

            <div className="border-b border-[#4A3F35]/10 py-5 md:border-b-0 md:border-r md:px-8">

              <div className="flex items-center gap-3">

                <BookIcon

                  size={16}

                  className="text-[#5C6B9C]"

                />

                <span className="text-xs uppercase tracking-[0.12em] text-[#4A3F35]/45">

                  Diary

                </span>

              </div>

              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#4A3F35]">

                {formatNumber(

                  summary.totalDiaries,

                )}

              </p>

              <p className="mt-1 text-xs text-[#4A3F35]/45">

                {isId

                  ? "cerita yang kamu tulis"

                  : "stories you put into words"}

              </p>

            </div>

            <div className="py-5 md:pl-8">

              <div className="flex items-center gap-3">

                <ChartIcon

                  size={16}

                  className="text-[#5C6B9C]"

                />

                <span className="text-xs uppercase tracking-[0.12em] text-[#4A3F35]/45">

                  {isId

                    ? "Stress rata-rata"

                    : "Average stress"}

                </span>

              </div>

              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#4A3F35]">

                {summary.averageStress ??

                  "—"}

              </p>

              <p className="mt-1 text-xs text-[#4A3F35]/45">

                {isId

                  ? "berdasarkan analisis yang tersedia"

                  : "based on available analyses"}

              </p>

            </div>

          </div>

        </section>

        {/* AI REFLECTION */}

        <section className="mb-12">

          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.6fr]">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5C6B9C]">

                {isId

                  ? "Teman refleksi"

                  : "Reflection companion"}

              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#4A3F35]">

                {isId

                  ? "Apa yang terlihat dari minggu ini?"

                  : "What does this week seem to say?"}

              </h2>

              <p className="mt-3 text-sm leading-7 text-[#4A3F35]/55">

                {isId

                  ? "Moodify membantu merangkum pola yang muncul dari check-in dan diary kamu."

                  : "Moodify looks across your check-ins and diary entries to help you notice patterns."}

              </p>

            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-[#FBC4AB]/35 p-6 md:p-8">

              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#FDFBF7]/50" />

              <div className="absolute -bottom-20 right-16 h-36 w-36 rounded-full bg-[#C1D5C0]/30" />

              <div className="relative">

                {loadingAI ? (

                  <div className="flex min-h-[180px] items-center">

                    <div>

                      <div className="mb-4 flex items-center gap-2 text-[#5C6B9C]">

                        <LoadingSpinner

                          size={16}

                        />

                        <span className="text-xs font-semibold uppercase tracking-[0.12em]">

                          {isId

                            ? "Membaca pola"

                            : "Reading your patterns"}

                        </span>

                      </div>

                      <p className="text-sm leading-7 text-[#4A3F35]/65">

                        {isId

                          ? "Moodify sedang menyusun refleksi dari aktivitasmu minggu ini."

                          : "Moodify is putting together a reflection from your week."}

                      </p>

                    </div>

                  </div>

                ) : weeklyAI ? (

                  <>

                    {weeklyAIStale && (
                      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#E2725B]/20 bg-[#FBC4AB]/15 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-[#4A3F35]/70">
                          {isId
                            ? "Ada data baru sejak insight ini dibuat. Perbarui jika kamu ingin memasukkannya."
                            : "New data is available since this insight was generated. Refresh to include it."}
                        </p>
                        <button
                          type="button"
                          onClick={handleRefreshWeeklyAI}
                          disabled={loadingAI}
                          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#E2725B] px-4 text-xs font-semibold text-white transition hover:bg-[#D96852] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loadingAI ? (
                            <>
                              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                              {isId ? "Memperbarui..." : "Refreshing..."}
                            </>
                          ) : (
                            isId ? "Perbarui insight" : "Refresh insight"
                          )}
                        </button>
                      </div>
                    )}
                    {weeklyAIError && (
                      <p role="alert" className="mb-4 text-xs text-[#B54735]">
                        {weeklyAIError}
                      </p>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5C6B9C]">

                      {isId

                        ? "Refleksi mingguan"

                        : "Weekly reflection"}

                    </p>

                    <h3 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-[#4A3F35] md:text-3xl">

                      {weeklyAI.headline}

                    </h3>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4A3F35]/70">

                      {weeklyAI.summary}

                    </p>

                    {weeklyAI.highlights

                      .length > 0 && (

                      <div className="mt-6 grid gap-3 md:grid-cols-2">

                        {weeklyAI.highlights.map(

                          (

                            highlight,

                            index,

                          ) => (

                            <div

                              key={`${index}-${highlight}`}

                              className="rounded-xl bg-[#FDFBF7]/70 p-4"

                            >

                              <span className="mb-2 block text-xs font-semibold text-[#5C6B9C]">

                                0

                                {index +

                                  1}

                              </span>

                              <p className="text-sm leading-6 text-[#4A3F35]/75">

                                {

                                  highlight

                                }

                              </p>

                            </div>

                          ),

                        )}

                      </div>

                    )}

                    <div className="mt-6 grid gap-3 md:grid-cols-2">

                      {weeklyAI.reflectionPrompt && (

                        <div className="rounded-xl bg-[#FDFBF7]/75 p-4">

                          <p className="text-xs font-semibold text-[#5C6B9C]">

                            {isId

                              ? "Untuk direnungkan"

                              : "Something to reflect on"}

                          </p>

                          <p className="mt-2 text-sm leading-6 text-[#4A3F35]/80">

                            {

                              weeklyAI.reflectionPrompt

                            }

                          </p>

                        </div>

                      )}

                      {weeklyAI.gentleSuggestion && (

                        <div className="rounded-xl bg-[#FDFBF7]/75 p-4">

                          <p className="text-xs font-semibold text-[#5C6B9C]">

                            {isId

                              ? "Langkah kecil"

                              : "A gentle next step"}

                          </p>

                          <p className="mt-2 text-sm leading-6 text-[#4A3F35]/80">

                            {

                              weeklyAI.gentleSuggestion

                            }

                          </p>

                        </div>

                      )}

                    </div>

                  </>

                ) : (

                  <div className="py-6">

                    <p className="text-sm leading-7 text-[#4A3F35]/65">

                      {isId

                        ? "Belum ada cukup data untuk membuat refleksi mingguan."

                        : "There is not enough data to create a weekly reflection yet."}

                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

        </section>

        {/* EMOTIONAL RHYTHM */}

        <section className="mb-12">

          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5C6B9C]">

                {isId

                  ? "Ritme emosional"

                  : "Emotional rhythm"}

              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#4A3F35]">

                {isId

                  ? "Bagaimana minggu ini terasa"

                  : "How the week moved"}

              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#4A3F35]/55">

                {isId

                  ? "Grafik ini menunjukkan perubahan stress yang tercatat setiap hari."

                  : "This shows how your recorded stress changed across the week."}

              </p>

            </div>

            {stressTrend === "up" && (

              <div className="flex items-center gap-2 text-xs font-medium text-[#E2725B]">

                <TrendUpIcon size={16} />

                {isId

                  ? "Stress cenderung meningkat"

                  : "Stress tended upward"}

              </div>

            )}

            {stressTrend === "down" && (

              <div className="flex items-center gap-2 text-xs font-medium text-[#5C6B9C]">

                <TrendDownIcon size={16} />

                {isId

                  ? "Stress cenderung menurun"

                  : "Stress tended downward"}

              </div>

            )}

            {stressTrend === "stable" && (

              <div className="text-xs font-medium text-[#4A3F35]/45">

                {isId

                  ? "Perubahannya relatif stabil"

                  : "The pattern stayed relatively steady"}

              </div>

            )}

          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[#4A3F35]/10 bg-[#FDFBF7]">

            <div className="grid min-h-[320px] grid-cols-7 gap-2 px-4 pb-5 pt-8 md:px-8">

              {summary.dailyTrend.map(

                (day) => {

                  const stress =

                    day.averageStress ??

                    0;

                  const height =

                    stress > 0

                      ? Math.max(

                          7,

                          Math.min(

                            100,

                            stress,

                          ),

                        )

                      : 4;

                  const hasActivity =

                    day.checkinCount >

                      0 ||

                    day.diaryCount > 0;

                  return (

                    <div

                      key={day.date}

                      className="group flex min-w-0 flex-col items-center"

                    >

                      <div className="relative flex h-56 w-full items-end justify-center">

                        <div className="absolute bottom-0 left-1/2 h-full w-px -translate-x-1/2 bg-[#4A3F35]/[0.06]" />

                        <div

                          className={[

                            "relative z-10 w-[70%] max-w-10 rounded-t-[1rem] transition-all duration-300",

                            hasActivity

                              ? "bg-[#FBC4AB]"

                              : "bg-[#C1D5C0]/45",

                            "group-hover:bg-[#E2725B]",

                          ].join(" ")}

                          style={{

                            height: `${height}%`,

                          }}

                          title={

                            day.averageStress !==

                            null

                              ? `Stress: ${day.averageStress}`

                              : isId

                                ? "Belum ada data"

                                : "No data"

                          }

                        >

                          {day.averageStress !==

                            null && (

                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-[#4A3F35]/0 transition-opacity group-hover:text-[#4A3F35]/60">

                              {

                                day.averageStress

                              }

                            </span>

                          )}

                        </div>

                      </div>

                      <span className="mt-4 text-[11px] font-semibold text-[#4A3F35]/50">

                        {getDayLabel(

                          day.date,

                          locale,

                        )}

                      </span>

                      <span className="mt-1 text-[10px] text-[#4A3F35]/35">

                        {day.checkinCount +

                          day.diaryCount}

                      </span>

                    </div>

                  );

                },

              )}

            </div>

            <div className="flex items-center justify-between border-t border-[#4A3F35]/8 px-5 py-4 text-[10px] uppercase tracking-[0.12em] text-[#4A3F35]/35 md:px-8">

              <span>0</span>

              <span>50</span>

              <span>100</span>

            </div>

          </div>

          {highestStress && (

            <p className="mt-3 text-xs leading-5 text-[#4A3F35]/45">

              {isId

                ? `Titik stress tertinggi tercatat pada ${getDateLabel(

                    highestStress.date,

                    locale,

                  )}.`

                : `Your highest recorded stress appeared on ${getDateLabel(

                    highestStress.date,

                    locale,

                  )}.`}

            </p>

          )}

        </section>

        {/* EMOTION + SENTIMENT */}

        <section className="mb-12 grid gap-10 lg:grid-cols-[1fr_1.15fr]">

          {/* DOMINANT EMOTION */}

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5C6B9C]">

              {isId

                ? "Emosi utama"

                : "Main emotion"}

            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#4A3F35]">

              {isId

                ? "Yang paling sering hadir"

                : "What showed up most"}

            </h2>

            <p className="mt-2 text-sm leading-6 text-[#4A3F35]/55">

              {isId

                ? "Bukan berarti ini satu-satunya yang kamu rasakan. Ini hanya emosi yang paling sering muncul dalam check-in."

                : "This does not mean it was the only thing you felt. It was simply the emotion that appeared most often in your check-ins."}

            </p>

            {summary.dominantEmotion ? (

              <div className="mt-7">

                <div className="flex items-end gap-4">

                  <span className="text-5xl font-semibold tracking-[-0.05em] text-[#4A3F35]">

                    {

                      summary

                        .dominantEmotion

                        .name

                    }

                  </span>

                </div>

                <p className="mt-2 text-sm text-[#4A3F35]/50">

                  {

                    summary

                      .dominantEmotion

                      .count

                  }{" "}

                  {isId

                    ? "kali tercatat"

                    : "times recorded"}

                </p>

                <div className="mt-7">

                  <div className="mb-2 flex items-center justify-between text-xs">

                    <span className="text-[#4A3F35]/50">

                      {isId

                        ? "Intensitas rata-rata"

                        : "Average intensity"}

                    </span>

                    <span className="font-semibold text-[#4A3F35]/75">

                      {

                        summary

                          .dominantEmotion

                          .averageIntensity

                      }

                      /10

                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#C1D5C0]/35">

                    <div

                      className="h-full rounded-full bg-[#E2725B]"

                      style={{

                        width: `${Math.min(

                          100,

                          Math.max(

                            0,

                            summary

                              .dominantEmotion

                              .averageIntensity *

                              10,

                          ),

                        )}%`,

                      }}

                    />

                  </div>

                </div>

              </div>

            ) : (

              <div className="mt-7 border-l-2 border-[#FBC4AB] pl-4">

                <p className="text-sm leading-6 text-[#4A3F35]/55">

                  {isId

                    ? "Belum cukup data untuk melihat emosi yang paling sering muncul."

                    : "There is not enough data to identify your most frequent emotion yet."}

                </p>

              </div>

            )}

          </div>

          {/* SENTIMENT */}

          <div className="rounded-[2rem] bg-[#C1D5C0]/25 p-6 md:p-8">

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5C6B9C]">

              {isId

                ? "Gambaran sentimen"

                : "Sentiment picture"}

            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#4A3F35]">

              {isId

                ? "Apa yang muncul dari analisis"

                : "What appeared in your analyses"}

            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-[#4A3F35]/55">

              {isId

                ? "Ringkasan ini berasal dari AI analysis yang tersedia selama periode ini."

                : "This summary comes from the AI analyses available during this period."}

            </p>

            <div className="mt-8">

              <div className="flex h-5 overflow-hidden rounded-full bg-[#FDFBF7]">

                <div

                  className="bg-[#5C6B9C]"

                  style={{

                    width: `${sentimentPercentages.positive}%`,

                  }}

                />

                <div

                  className="bg-[#C1D5C0]"

                  style={{

                    width: `${sentimentPercentages.neutral}%`,

                  }}

                />

                <div

                  className="bg-[#E2725B]"

                  style={{

                    width: `${sentimentPercentages.negative}%`,

                  }}

                />

              </div>

              <div className="mt-5 grid grid-cols-3 gap-4">

                <div>

                  <div className="mb-2 flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-[#5C6B9C]" />

                    <span className="text-xs text-[#4A3F35]/50">

                      {isId

                        ? "Positif"

                        : "Positive"}

                    </span>

                  </div>

                  <p className="text-2xl font-semibold text-[#4A3F35]">

                    {

                      sentimentPercentages.positive

                    }

                    %

                  </p>

                </div>

                <div>

                  <div className="mb-2 flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-[#C1D5C0]" />

                    <span className="text-xs text-[#4A3F35]/50">

                      {isId

                        ? "Netral"

                        : "Neutral"}

                    </span>

                  </div>

                  <p className="text-2xl font-semibold text-[#4A3F35]">

                    {

                      sentimentPercentages.neutral

                    }

                    %

                  </p>

                </div>

                <div>

                  <div className="mb-2 flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-[#E2725B]" />

                    <span className="text-xs text-[#4A3F35]/50">

                      {isId

                        ? "Negatif"

                        : "Negative"}

                    </span>

                  </div>

                  <p className="text-2xl font-semibold text-[#4A3F35]">

                    {

                      sentimentPercentages.negative

                    }

                    %

                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* WELLBEING ACTIVITIES */}

        <section className="mb-12">

          <div className="mb-6 max-w-xl">

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5C6B9C]">

              {isId

                ? "Hal yang kamu lakukan"

                : "Things you practiced"}

            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#4A3F35]">

              {isId

                ? "Aktivitas wellbeing"

                : "Wellbeing activities"}

            </h2>

            <p className="mt-2 text-sm leading-6 text-[#4A3F35]/55">

              {isId

                ? "Bukan soal seberapa produktif kamu. Bagian ini hanya mencatat aktivitas yang kamu coba."

                : "This is not about productivity. It simply keeps track of the activities you tried."}

            </p>

          </div>

          <div className="grid border-y border-[#4A3F35]/10 sm:grid-cols-2 lg:grid-cols-4">

            <div className="border-b border-[#4A3F35]/10 py-5 sm:border-r lg:border-b-0 lg:pr-6">

              <p className="text-xs uppercase tracking-[0.12em] text-[#4A3F35]/45">

                {isId

                  ? "Dimulai"

                  : "Started"}

              </p>

              <p className="mt-2 text-3xl font-semibold text-[#4A3F35]">

                {

                  summary.activity

                    .totalStarted

                }

              </p>

              <p className="mt-1 text-xs text-[#4A3F35]/40">

                {isId

                  ? "aktivitas"

                  : "activities"}

              </p>

            </div>

            <div className="border-b border-[#4A3F35]/10 py-5 sm:pl-6 lg:border-b-0 lg:border-r lg:px-6">

              <p className="text-xs uppercase tracking-[0.12em] text-[#4A3F35]/45">

                {isId

                  ? "Selesai"

                  : "Completed"}

              </p>

              <p className="mt-2 text-3xl font-semibold text-[#4A3F35]">

                {

                  summary.activity

                    .totalCompleted

                }

              </p>

              <p className="mt-1 text-xs text-[#4A3F35]/40">

                {isId

                  ? "aktivitas"

                  : "activities"}

              </p>

            </div>

            <div className="border-b border-[#4A3F35]/10 py-5 sm:border-r sm:pl-0 sm:pr-6 lg:border-b-0 lg:border-r lg:px-6">

              <p className="text-xs uppercase tracking-[0.12em] text-[#4A3F35]/45">

                Completion rate

              </p>

              <p className="mt-2 text-3xl font-semibold text-[#4A3F35]">

                {

                  summary.activity

                    .completionRate

                }

                %

              </p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#C1D5C0]/35">

                <div

                  className="h-full rounded-full bg-[#5C6B9C]"

                  style={{

                    width: `${Math.min(

                      100,

                      Math.max(

                        0,

                        summary

                          .activity

                          .completionRate,

                      ),

                    )}%`,

                  }}

                />

              </div>

            </div>

            <div className="py-5 sm:pl-6 lg:pl-6">

              <p className="text-xs uppercase tracking-[0.12em] text-[#4A3F35]/45">

                {isId

                  ? "Rata-rata rating"

                  : "Average rating"}

              </p>

              <p className="mt-2 text-3xl font-semibold text-[#4A3F35]">

                {

                  summary.activity

                    .averageRating ?? "—"

                }

                {summary.activity

                  .averageRating !==

                  null && (

                  <span className="ml-1 text-sm font-normal text-[#4A3F35]/40">

                    / 5

                  </span>

                )}

              </p>

              <p className="mt-1 text-xs text-[#4A3F35]/40">

                {isId

                  ? "dari aktivitas yang dinilai"

                  : "from rated activities"}

              </p>

            </div>

          </div>

          {summary.activity

            .mostUsed && (

            <div className="mt-5 flex flex-col gap-3 border-l-2 border-[#FBC4AB] pl-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5C6B9C]">

                  {isId

                    ? "Yang paling sering kamu pilih"

                    : "Your most-used activity"}

                </p>

                <h3 className="mt-1 text-lg font-semibold text-[#4A3F35]">

                  {

                    summary.activity

                      .mostUsed.title

                  }

                </h3>

              </div>

              <p className="text-sm text-[#4A3F35]/50">

                {

                  summary.activity

                    .mostUsed.count

                }{" "}

                {isId

                  ? "kali digunakan"

                  : "times used"}

              </p>

            </div>

          )}

        </section>

        {/* CONTEXT + TRIGGERS */}

        <section className="mb-12">

          <div className="mb-7">

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5C6B9C]">

              {isId

                ? "Pola yang muncul"

                : "Patterns"}

            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#4A3F35]">

              {isId

                ? "Hal-hal yang sering hadir bersamaan"

                : "Things that tended to show up together"}

            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4A3F35]/55">

              {isId

                ? "Gunakan bagian ini sebagai petunjuk untuk mengenali kebiasaan atau konteks yang mungkin berhubungan dengan perasaanmu."

                : "Use these as clues for noticing contexts or patterns that may be connected to how you felt."}

            </p>

          </div>

          <div className="grid gap-10 md:grid-cols-2">

            {/* CONTEXT */}

            <div>

              <h3 className="text-sm font-semibold text-[#4A3F35]">

                {isId

                  ? "Konteks yang sering dipilih"

                  : "Common contexts"}

              </h3>

              <div className="mt-4">

                {summary

                  .commonContexts

                  .length > 0 ? (

                  <div className="divide-y divide-[#4A3F35]/8">

                    {summary.commonContexts.map(

                      (context) => (

                        <div

                          key={

                            context.slug

                          }

                          className="flex items-center justify-between py-3.5"

                        >

                          <span className="text-sm text-[#4A3F35]/75">

                            {

                              context.name

                            }

                          </span>

                          <span className="rounded-full bg-[#C1D5C0]/30 px-2.5 py-1 text-[11px] font-medium text-[#4A3F35]/55">

                            {

                              context.count

                            }

                            x

                          </span>

                        </div>

                      ),

                    )}

                  </div>

                ) : (

                  <div className="border-l-2 border-[#C1D5C0] pl-4">

                    <p className="text-sm leading-6 text-[#4A3F35]/50">

                      {isId

                        ? "Belum ada konteks yang cukup untuk dilihat."

                        : "There are not enough context entries yet."}

                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* TRIGGERS */}

            <div>

              <h3 className="text-sm font-semibold text-[#4A3F35]">

                {isId

                  ? "Kemungkinan pemicu"

                  : "Possible triggers"}

              </h3>

              <p className="mt-1 text-xs text-[#4A3F35]/45">

                {isId

                  ? "Pola yang terdeteksi dari AI, bukan diagnosis."

                  : "Patterns identified by AI, not a diagnosis."}

              </p>

              <div className="mt-4">

                {summary

                  .possibleTriggers

                  .length > 0 ? (

                  <div className="divide-y divide-[#4A3F35]/8">

                    {summary.possibleTriggers.map(

                      (trigger) => (

                        <div

                          key={

                            trigger.name

                          }

                          className="flex items-center justify-between py-3.5"

                        >

                          <span className="text-sm text-[#4A3F35]/75">

                            {

                              trigger.name

                            }

                          </span>

                          <span className="rounded-full bg-[#FBC4AB]/35 px-2.5 py-1 text-[11px] font-medium text-[#4A3F35]/55">

                            {

                              trigger.count

                            }

                            x

                          </span>

                        </div>

                      ),

                    )}

                  </div>

                ) : (

                  <div className="border-l-2 border-[#FBC4AB] pl-4">

                    <p className="text-sm leading-6 text-[#4A3F35]/50">

                      {isId

                        ? "Belum ada pola yang cukup kuat untuk ditampilkan."

                        : "There is not enough evidence for a strong pattern yet."}

                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

        </section>

        {/* ABOUT INSIGHTS */}

        <section className="border-t border-[#4A3F35]/10 pt-7">

          <div className="max-w-3xl">

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5C6B9C]">

              {isId

                ? "Catatan kecil"

                : "A small note"}

            </p>

            <h2 className="mt-2 text-lg font-semibold text-[#4A3F35]">

              {isId

                ? "Tentang Insights Moodify"

                : "About Moodify Insights"}

            </h2>

            <p className="mt-2 text-xs leading-6 text-[#4A3F35]/55">

              {isId

                ? "Insights Moodify adalah ringkasan pola dari data check-in, diary, aktivitas, dan analisis AI kamu. Hasil ini dimaksudkan untuk membantu refleksi pribadi dan bukan merupakan diagnosis medis atau psikologis."

                : "Moodify Insights summarizes patterns from your check-ins, diary entries, activities, and AI analyses. It is intended to support personal reflection and is not a medical or psychological diagnosis."}

            </p>

          </div>

        </section>

      </div>

    </main>

  );

}
