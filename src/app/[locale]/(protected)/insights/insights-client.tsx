"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

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

export default function InsightsClient({
  locale,
  userName,
}: Props) {
  const isId = locale === "id";

  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weeklyAI, setWeeklyAI] = useState<{
    headline: string;
    summary: string;
    highlights: string[];
    reflectionPrompt: string;
    gentleSuggestion: string;
  } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchInsights() {
      try {
        const response = await fetch("/api/insights/weekly", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Failed to load insights",
          );
        }

        if (cancelled) return;

        setData(result);
        setLoadingAI(true);

        try {
          const aiResponse = await fetch(
            "/api/ai/weekly-summary",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                language: locale === "id" ? "id" : "en",
              }),
            },
          );

          const aiResult = await aiResponse.json();

          if (!cancelled && aiResponse.ok && aiResult.summary) {
            setWeeklyAI(aiResult.summary);
          }
        } catch (aiError) {
          console.error("Weekly AI error:", aiError);
        } finally {
          if (!cancelled) {
            setLoadingAI(false);
          }
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            isId
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

    fetchInsights();

    return () => {
      cancelled = true;
    };
  }, [isId, locale]);

  const weekLabel = useMemo(() => {
    if (!data) return "";

    const start = new Date(data.period.start);
    const end = new Date(data.period.end);

    const formatter = new Intl.DateTimeFormat(
      isId ? "id-ID" : "en-US",
      {
        day: "numeric",
        month: "short",
      },
    );

    return `${formatter.format(start)} – ${formatter.format(end)}`;
  }, [data, isId]);

  const stressTrend = useMemo(() => {
    if (!data) return "stable";

    const values = data.summary.dailyTrend
      .map((item) => item.averageStress)
      .filter(
        (value): value is number =>
          typeof value === "number",
      );

    if (values.length < 2) {
      return "stable";
    }

    const first = values[0];
    const last = values[values.length - 1];

    if (last > first + 8) {
      return "up";
    }

    if (last < first - 8) {
      return "down";
    }

    return "stable";
  }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fdfbf7] px-4 py-8 md:px-8">
        <div className="mx-auto flex min-h-[500px] max-w-6xl items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-[#4a3f35]/60">
            <Loader2 className="h-5 w-5 animate-spin" />
            {isId
              ? "Menganalisis minggu kamu..."
              : "Analyzing your week..."}
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#fdfbf7] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-[#e2725b]/25 bg-[#e2725b]/10 p-5 text-sm text-[#e2725b]">
            {error ||
              (isId
                ? "Data insights belum tersedia."
                : "Insights data is not available.")}
          </div>
        </div>
      </main>
    );
  }

  const { summary } = data;

  const totalSentiment =
    summary.sentiment.POSITIVE +
    summary.sentiment.NEUTRAL +
    summary.sentiment.NEGATIVE;

  const positivePercentage =
    totalSentiment > 0
      ? Math.round(
          (summary.sentiment.POSITIVE /
            totalSentiment) *
            100,
        )
      : 0;

  const neutralPercentage =
    totalSentiment > 0
      ? Math.round(
          (summary.sentiment.NEUTRAL /
            totalSentiment) *
            100,
        )
      : 0;

  const negativePercentage =
    totalSentiment > 0
      ? Math.round(
          (summary.sentiment.NEGATIVE /
            totalSentiment) *
            100,
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#fdfbf7] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-[#5c6b9c]">
            <Sparkles className="h-4 w-4" />
            <span>
              {isId
                ? "Emotional Insights"
                : "Emotional Insights"}
            </span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#4a3f35] md:text-3xl">
                {isId
                  ? `Perjalanan emosimu, ${userName}`
                  : `Your emotional journey, ${userName}`}
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#4a3f35]/60">
                {isId
                  ? "Lihat pola emosimu berdasarkan check-in dan diary selama 7 hari terakhir."
                  : "Understand your emotional patterns based on your check-ins and diary entries from the last 7 days."}
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#4a3f35]/12 bg-[#fdfbf7] px-4 py-2.5 text-sm text-[#4a3f35]/70">
              <CalendarDays className="h-4 w-4 text-[#5c6b9c]" />
              {weekLabel}
              <ChevronDown className="h-4 w-4 text-[#4a3f35]/45" />
            </div>
          </div>
        </header>

        {/* WEEKLY AI SUMMARY */}
        <section className="mb-6 rounded-2xl border border-[#e2725b]/20 bg-[#fbc4ab]/20 p-5 md:p-6">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fdfbf7] text-[#5c6b9c]">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-[#5c6b9c]">
                Weekly AI Reflection
              </p>

              {loadingAI ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-[#4a3f35]/75">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isId
                    ? "Moodify sedang membaca pola minggu ini..."
                    : "Moodify is reviewing your weekly patterns..."}
                </div>
              ) : weeklyAI ? (
                <>
                  <h2 className="mt-2 text-lg font-semibold text-[#4a3f35]">
                    {weeklyAI.headline}
                  </h2>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4a3f35]/70">
                    {weeklyAI.summary}
                  </p>

                  {weeklyAI.highlights.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {weeklyAI.highlights.map((highlight, index) => (
                        <div
                          key={`${index}-${highlight}`}
                          className="flex gap-2 text-sm text-[#4a3f35]/70"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#fbc4ab]" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {weeklyAI.reflectionPrompt && (
                    <div className="mt-5 rounded-xl bg-[#fdfbf7]/80 p-4">
                      <p className="text-xs font-medium text-[#5c6b9c]">
                        {isId ? "Pertanyaan refleksi" : "Reflection prompt"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#4a3f35]/85">
                        {weeklyAI.reflectionPrompt}
                      </p>
                    </div>
                  )}

                  {weeklyAI.gentleSuggestion && (
                    <div className="mt-3 rounded-xl bg-[#fdfbf7]/80 p-4">
                      <p className="text-xs font-medium text-[#5c6b9c]">
                        {isId ? "Saran kecil" : "Gentle suggestion"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#4a3f35]/85">
                        {weeklyAI.gentleSuggestion}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-2 text-sm text-[#4a3f35]/60">
                  {isId
                    ? "Belum cukup data untuk membuat refleksi mingguan."
                    : "There is not enough data for a weekly reflection yet."}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* OVERVIEW CARDS */}
        <section className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbc4ab]/30 text-[#5c6b9c]">
                <Activity className="h-5 w-5" />
              </div>

              <span className="text-xs text-[#4a3f35]/45">
                {isId ? "7 hari" : "7 days"}
              </span>
            </div>

            <p className="text-sm text-[#4a3f35]/60">
              {isId
                ? "Total Check-in"
                : "Total Check-ins"}
            </p>

            <p className="mt-1 text-2xl font-semibold text-[#4a3f35]">
              {summary.totalCheckins}
            </p>
          </div>

          <div className="rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c1d5c0]/35 text-[#4a3f35]">
                <BookOpen className="h-5 w-5" />
              </div>

              <span className="text-xs text-[#4a3f35]/45">
                {isId ? "Refleksi" : "Reflections"}
              </span>
            </div>

            <p className="text-sm text-[#4a3f35]/60">
              {isId
                ? "Diary Ditulis"
                : "Diary Entries"}
            </p>

            <p className="mt-1 text-2xl font-semibold text-[#4a3f35]">
              {summary.totalDiaries}
            </p>
          </div>

          <div className="rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbc4ab]/25 text-[#e2725b]">
                <BarChart3 className="h-5 w-5" />
              </div>

              <span className="text-xs text-[#4a3f35]/45">
                {isId ? "Rata-rata" : "Average"}
              </span>
            </div>

            <p className="text-sm text-[#4a3f35]/60">
              {isId
                ? "Stress Score"
                : "Stress Score"}
            </p>

            <p className="mt-1 text-2xl font-semibold text-[#4a3f35]">
              {summary.averageStress ?? "—"}
            </p>
          </div>

        </section>

        {/* MAIN GRID */}
        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">

          {/* EMOTIONAL FLOW */}
          <div className="rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5 md:p-6">

            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-[#4a3f35]">
                  {isId
                    ? "Alur Emosional"
                    : "Emotional Flow"}
                </h2>

                <p className="mt-1 text-sm text-[#4a3f35]/60">
                  {isId
                    ? "Perubahan stress dan aktivitas emosional selama minggu ini."
                    : "Changes in stress and emotional activity throughout the week."}
                </p>
              </div>

              {stressTrend === "up" && (
                <div className="flex items-center gap-1 rounded-full bg-[#e2725b]/10 px-3 py-1.5 text-xs font-medium text-[#e2725b]">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {isId ? "Naik" : "Rising"}
                </div>
              )}

              {stressTrend === "down" && (
                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-[#5c6b9c]">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {isId ? "Turun" : "Lower"}
                </div>
              )}
            </div>

            <div className="flex h-64 items-end gap-2 md:gap-4">
              {summary.dailyTrend.map((day) => {
                const stress =
                  day.averageStress ?? 0;

                const height =
                  stress > 0
                    ? Math.max(
                        8,
                        Math.min(100, stress),
                      )
                    : 4;

                const date = new Date(
                  `${day.date}T00:00:00`,
                );

                const label =
                  new Intl.DateTimeFormat(
                    isId ? "id-ID" : "en-US",
                    {
                      weekday: "short",
                    },
                  ).format(date);

                return (
                  <div
                    key={day.date}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="relative flex h-full w-full items-end justify-center">
                      <div
                        title={
                          day.averageStress !== null
                            ? `Stress: ${day.averageStress}`
                            : "No data"
                        }
                        className="w-full max-w-10 rounded-t-xl bg-[#fbc4ab]/45 transition-all hover:bg-[#fbc4ab]/70"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    </div>

                    <span className="text-[11px] font-medium text-[#4a3f35]/45">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#4a3f35]/8 pt-4 text-xs text-[#4a3f35]/45">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          {/* DOMINANT EMOTION */}
          <div className="rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5 md:p-6">

            <h2 className="font-semibold text-[#4a3f35]">
              {isId
                ? "Emosi yang Paling Sering Muncul"
                : "Most Frequent Emotion"}
            </h2>

            <p className="mt-1 text-sm text-[#4a3f35]/60">
              {isId
                ? "Berdasarkan check-in minggu ini."
                : "Based on this week's check-ins."}
            </p>

            {summary.dominantEmotion ? (
              <div className="mt-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fbc4ab]/30">
                    <Activity className="h-7 w-7 text-[#5c6b9c]" />
                  </div>

                  <div>
                    <p className="text-xl font-semibold text-[#4a3f35]">
                      {summary.dominantEmotion.name}
                    </p>

                    <p className="mt-1 text-sm text-[#4a3f35]/60">
                      {summary.dominantEmotion.count}{" "}
                      {isId
                        ? "kali tercatat"
                        : "times recorded"}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="mb-2 flex justify-between text-xs text-[#4a3f35]/60">
                    <span>
                      {isId
                        ? "Intensitas rata-rata"
                        : "Average intensity"}
                    </span>

                    <span className="font-medium text-[#4a3f35]/85">
                      {summary.dominantEmotion.averageIntensity}
                      /10
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#c1d5c0]/30">
                    <div
                      className="h-full rounded-full bg-[#e2725b]"
                      style={{
                        width: `${
                          summary.dominantEmotion.averageIntensity *
                          10
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-xl bg-[#fdfbf7]/80 p-5 text-center text-sm text-[#4a3f35]/60">
                {isId
                  ? "Belum cukup data emosi."
                  : "Not enough emotion data yet."}
              </div>
            )}
          </div>
        </section>

        {/* ACTIVITY INSIGHTS */}
        <section className="mt-6">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#5c6b9c]" />
              <p className="text-sm font-semibold text-[#5c6b9c]">
                {isId
                  ? "Wellbeing Activities"
                  : "Wellbeing Activities"}
              </p>
            </div>

            <h2 className="mt-1 text-xl font-bold text-[#4a3f35]">
              {isId
                ? "Aktivitas wellbeing kamu"
                : "Your wellbeing activities"}
            </h2>

            <p className="mt-1 text-sm text-[#4a3f35]/60">
              {isId
                ? "Ringkasan aktivitas yang kamu lakukan minggu ini."
                : "A summary of the activities you practiced this week."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5">
              <p className="text-sm text-[#4a3f35]/60">
                {isId ? "Dimulai" : "Started"}
              </p>
              <p className="mt-2 text-3xl font-bold text-[#4a3f35]">
                {summary.activity.totalStarted}
              </p>
              <p className="mt-1 text-xs text-[#4a3f35]/45">
                {isId ? "aktivitas" : "activities"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5">
              <p className="text-sm text-[#4a3f35]/60">
                {isId ? "Selesai" : "Completed"}
              </p>
              <p className="mt-2 text-3xl font-bold text-[#4a3f35]">
                {summary.activity.totalCompleted}
              </p>
              <p className="mt-1 text-xs text-[#4a3f35]/45">
                {isId ? "aktivitas" : "activities"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5">
              <p className="text-sm text-[#4a3f35]/60">
                Completion Rate
              </p>
              <p className="mt-2 text-3xl font-bold text-[#4a3f35]">
                {summary.activity.completionRate}%
              </p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#c1d5c0]/30">
                <div
                  className="h-full rounded-full bg-[#e2725b] transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        summary.activity.completionRate,
                      ),
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5">
              <p className="text-sm text-[#4a3f35]/60">
                {isId ? "Rata-rata Rating" : "Average Rating"}
              </p>

              <p className="mt-2 text-3xl font-bold text-[#4a3f35]">
                {summary.activity.averageRating ?? "—"}
                {summary.activity.averageRating !== null && (
                  <span className="ml-1 text-base font-medium text-[#4a3f35]/45">
                    / 5
                  </span>
                )}
              </p>

              <p className="mt-1 text-xs text-[#4a3f35]/45">
                {isId
                  ? "dari aktivitas yang dinilai"
                  : "from rated activities"}
              </p>
            </div>
          </div>

          {summary.activity.mostUsed && (
            <div className="mt-4 rounded-2xl border border-[#e2725b]/20 bg-[#fbc4ab]/30/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6b9c]">
                {isId
                  ? "Aktivitas paling sering digunakan"
                  : "Most used activity"}
              </p>

              <div className="mt-2 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#4a3f35]">
                    {summary.activity.mostUsed.title}
                  </h3>

                  <p className="mt-1 text-sm text-[#4a3f35]/60">
                    {summary.activity.mostUsed.count}{" "}
                    {isId ? "kali digunakan" : "times used"}
                  </p>
                </div>

                <Sparkles className="h-5 w-5 shrink-0 text-[#5c6b9c]" />
              </div>
            </div>
          )}
        </section>

        {/* SENTIMENT */}
        <section className="mt-6 rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5 md:p-6">

          <div className="mb-6">
            <h2 className="font-semibold text-[#4a3f35]">
              {isId
                ? "Distribusi Sentimen"
                : "Sentiment Distribution"}
            </h2>

            <p className="mt-1 text-sm text-[#4a3f35]/60">
              {isId
                ? "Ringkasan sentimen dari AI Analysis."
                : "Sentiment summary from your AI analyses."}
            </p>
          </div>

          <div className="h-4 overflow-hidden rounded-full bg-[#c1d5c0]/30">
            <div className="flex h-full">
              <div
                className="bg-[#c1d5c0]"
                style={{
                  width: `${positivePercentage}%`,
                }}
              />

              <div
                className="bg-[#c1d5c0]"
                style={{
                  width: `${neutralPercentage}%`,
                }}
              />

              <div
                className="bg-[#e2725b]"
                style={{
                  width: `${negativePercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">

            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#c1d5c0]" />
                <span className="text-xs text-[#4a3f35]/60">
                  {isId ? "Positif" : "Positive"}
                </span>
              </div>

              <p className="text-lg font-semibold text-[#4a3f35]">
                {positivePercentage}%
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#c1d5c0]" />
                <span className="text-xs text-[#4a3f35]/60">
                  {isId ? "Netral" : "Neutral"}
                </span>
              </div>

              <p className="text-lg font-semibold text-[#4a3f35]">
                {neutralPercentage}%
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#e2725b]" />
                <span className="text-xs text-[#4a3f35]/60">
                  {isId ? "Negatif" : "Negative"}
                </span>
              </div>

              <p className="text-lg font-semibold text-[#4a3f35]">
                {negativePercentage}%
              </p>
            </div>

          </div>
        </section>

        {/* CONTEXT + TRIGGERS */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5 md:p-6">
            <h2 className="font-semibold text-[#4a3f35]">
              {isId
                ? "Hal yang Sering Muncul"
                : "Common Contexts"}
            </h2>

            <p className="mt-1 text-sm text-[#4a3f35]/60">
              {isId
                ? "Konteks yang paling sering kamu pilih."
                : "Contexts that appeared most often."}
            </p>

            <div className="mt-5 space-y-3">
              {summary.commonContexts.length > 0 ? (
                summary.commonContexts.map(
                  (context) => (
                    <div
                      key={context.slug}
                      className="flex items-center justify-between rounded-xl bg-[#fdfbf7]/80 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-[#4a3f35]/85">
                        {context.name}
                      </span>

                      <span className="text-xs text-[#4a3f35]/45">
                        {context.count}x
                      </span>
                    </div>
                  ),
                )
              ) : (
                <p className="rounded-xl bg-[#fdfbf7]/80 p-4 text-sm text-[#4a3f35]/60">
                  {isId
                    ? "Belum ada data."
                    : "No data yet."}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5 md:p-6">
            <h2 className="font-semibold text-[#4a3f35]">
              {isId
                ? "Possible Triggers"
                : "Possible Triggers"}
            </h2>

            <p className="mt-1 text-sm text-[#4a3f35]/60">
              {isId
                ? "Pola yang terdeteksi dari AI."
                : "Patterns identified by AI."}
            </p>

            <div className="mt-5 space-y-3">
              {summary.possibleTriggers.length > 0 ? (
                summary.possibleTriggers.map(
                  (trigger) => (
                    <div
                      key={trigger.name}
                      className="flex items-center justify-between rounded-xl bg-[#fdfbf7]/80 px-4 py-3"
                    >
                      <span className="text-sm text-[#4a3f35]/85">
                        {trigger.name}
                      </span>

                      <span className="text-xs text-[#4a3f35]/45">
                        {trigger.count}x
                      </span>
                    </div>
                  ),
                )
              ) : (
                <p className="rounded-xl bg-[#fdfbf7]/80 p-4 text-sm text-[#4a3f35]/60">
                  {isId
                    ? "Belum ada pola yang cukup kuat."
                    : "No strong pattern yet."}
                </p>
              )}
            </div>
          </div>

        </section>

        {/* DISCLAIMER */}
        <div className="mt-6 rounded-2xl border border-[#e2725b]/20 bg-[#fbc4ab]/30/60 p-5">
          <div className="flex gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#5c6b9c]" />

            <div>
              <p className="text-sm font-medium text-[#4a3f35]">
                {isId
                  ? "Tentang Insights"
                  : "About Insights"}
              </p>

              <p className="mt-1 text-xs leading-6 text-[#4a3f35]/75">
                {isId
                  ? "Insights Moodify adalah ringkasan pola dari data check-in, diary, dan analisis AI kamu. Ini bukan diagnosis medis atau psikologis."
                  : "Moodify Insights summarizes patterns from your check-ins, diary entries, and AI analyses. It is not a medical or psychological diagnosis."}
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}