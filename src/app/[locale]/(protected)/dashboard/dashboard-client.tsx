"use client"

/* eslint-disable react-hooks/exhaustive-deps */

import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  MessageCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Locale } from "@/i18n/config";

type Emotion = {
  id: string;
  name: string;
  slug: string;
  category: string;
  intensity?: number;
  note?: string | null;
};

type Analysis = {
  id: string;
  summary: string;
  validationMessage?: string | null;
  stressScore?: number | null;
  sentiment?: string | null;
  emotionalState?: string | null;
  possibleTriggers?: unknown;
  thinkingPatterns?: unknown;
  recommendations?: unknown;
  riskLevel?: string | null;
  createdAt: string;
};

type Checkin = {
  date: string | number | Date;
  id: string;
  checkinDate: string;
  overallIntensity?: number | null;
  emotions: Emotion[];
  analysis: {
    stressScore?: number | null;
    sentiment?: string | null;
    emotionalState?: string | null;
    riskLevel?: string | null;
  } | null;
};

type Diary = {
  id: string;
  content?: string | null;
  entryType: string;
  audioUrl?: string | null;
  durationSeconds?: number | null;
  createdAt: string;
  aiAnalyses?: Analysis[];
};

type ActivityItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  durationMinutes: number;
  difficulty: string;
};

type DashboardData = {
  user: {
    id: string;
    name: string;
  };
  today: {
    hasCheckin: boolean;
    checkin: {
      id: string;
      emotions: Emotion[];
      diaryEntries?: Diary[];
    } | null;
    analysis: Analysis | null;
  };
  latestDiary: Diary | null;
  latestAnalysis: Analysis | null;
  recommendedActivities: ActivityItem[];
  weekly: {
    startDate: string;
    endDate: string;
    checkins: Checkin[];
  };
};

export default function DashboardClient({
  locale,
  userName,
}: {
  locale: Locale;
  userName: string;
}) {
  const isEnglish = locale === "en";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/dashboard", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ??
              (isEnglish
                ? "Failed to load dashboard."
                : "Gagal memuat dashboard."),
          );
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : isEnglish
                ? "Failed to load dashboard."
                : "Gagal memuat dashboard.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [isEnglish]);

  const weeklyCheckins = data?.weekly.checkins ?? [];

  const streak = useMemo(() => {
    if (!weeklyCheckins.length) return 0;

    const dates = new Set(
      weeklyCheckins.map((item) =>
        new Date(item.date).toISOString().slice(0, 10),
      ),
    );

    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    let count = 0;

    for (let i = 0; i < 30; i++) {
      const key = cursor.toISOString().slice(0, 10);

      if (!dates.has(key)) break;

      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return count;
  }, [weeklyCheckins]);

  const weeklyBars = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));

      const key = date.toISOString().slice(0, 10);
      const checkin = weeklyCheckins.find(
        (item) =>
          new Date(item.date).toISOString().slice(0, 10) === key,
      );

      const intensity =
        checkin?.overallIntensity ??
        checkin?.emotions?.[0]?.intensity ??
        0;

      const height = intensity
        ? Math.max(14, Math.min(100, intensity * 10))
        : 8;

      return {
        key,
        date,
        checkin,
        height,
      };
    });
  }, [weeklyCheckins]);

  const weeklyEmotion = useMemo(() => {
    const emotions = weeklyCheckins.flatMap((checkin) => checkin.emotions);
    if (!emotions.length) return null;

    const counts = new Map<string, { name: string; count: number }>();

    for (const emotion of emotions) {
      const current = counts.get(emotion.slug);

      counts.set(emotion.slug, {
        name: emotion.name,
        count: (current?.count ?? 0) + 1,
      });
    }

    return [...counts.values()].sort((a, b) => b.count - a.count)[0];
  }, [weeklyCheckins]);

  const todayAnalysis = data?.today.analysis;
  const latestDiary = data?.latestDiary;
  const recommendedActivity = data?.recommendedActivities?.[0];

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(isEnglish ? "en-US" : "id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));

  const dayLabel = (date: Date) =>
    new Intl.DateTimeFormat(isEnglish ? "en-US" : "id-ID", {
      weekday: "short",
    }).format(date);

  return (
      <div className="space-y-8">
        <section>
          <p className="text-sm font-medium text-indigo-600">
            {isEnglish ? "Good to see you" : "Senang melihatmu lagi"}
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-[-0.035em] text-gray-900">
            {isEnglish
              ? `Good morning, ${userName}`
              : `Selamat pagi, ${userName}`}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {isEnglish
              ? "Take a moment to check in with yourself today."
              : "Luangkan sedikit waktu untuk memahami perasaanmu hari ini."}
          </p>
        </section>

        {error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-600 shadow-sm">
          <div className="relative p-6 sm:p-8">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/[0.06]" />
            <div className="absolute -bottom-24 right-24 h-40 w-40 rounded-full bg-white/[0.04]" />

            <div className="relative z-10 max-w-2xl">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <Heart className="h-5 w-5 text-white" strokeWidth={1.8} />
              </div>

              <p className="text-sm font-medium text-indigo-100">
                {isEnglish
                  ? "Daily Emotional Check-in"
                  : "Check-in Emosional Harian"}
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.025em] text-white sm:text-3xl">
                {data?.today.hasCheckin
                  ? isEnglish
                    ? "You've checked in today."
                    : "Kamu sudah check-in hari ini."
                  : isEnglish
                    ? "How are you feeling today?"
                    : "Bagaimana perasaanmu hari ini?"}
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-6 text-indigo-100">
                {data?.today.hasCheckin
                  ? isEnglish
                    ? "Your emotional check-in is saved. You can review the insight or add another reflection."
                    : "Check-in emosionalmu sudah tersimpan. Kamu bisa melihat insight atau menambahkan refleksi."
                  : isEnglish
                    ? "A quick check-in can help you notice how you're feeling and build a better understanding of your emotional patterns."
                    : "Check-in singkat dapat membantu kamu menyadari perasaanmu dan memahami pola emosionalmu dari waktu ke waktu."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/check-in`}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
                >
                  <Heart className="h-4 w-4" strokeWidth={1.8} />
                  {data?.today.hasCheckin
                    ? isEnglish
                      ? "Check in again"
                      : "Check-in lagi"
                    : isEnglish
                      ? "Start check-in"
                      : "Mulai check-in"}
                </Link>

                <Link
                  href={`/${locale}/diary`}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
                  {isEnglish ? "Write a reflection" : "Tulis refleksi"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <OverviewCard
            icon={<CalendarDays className="h-5 w-5" />}
            title={isEnglish ? "Check-in streak" : "Streak check-in"}
            value={`${streak} ${isEnglish ? "days" : "hari"}`}
            description={
              streak > 0
                ? isEnglish
                  ? "Keep checking in to build your rhythm"
                  : "Lanjutkan check-in untuk menjaga ritmemu"
                : isEnglish
                  ? "Start your first check-in"
                  : "Mulai check-in pertamamu"
            }
          />

          <OverviewCard
            icon={<Activity className="h-5 w-5" />}
            title={isEnglish ? "Emotional overview" : "Gambaran emosional"}
            value={
              weeklyEmotion?.name ??
              (loading ? "..." : "—")
            }
            description={
              weeklyEmotion
                ? isEnglish
                  ? `Appeared ${weeklyEmotion.count} time${weeklyEmotion.count > 1 ? "s" : ""} this week`
                  : `Muncul ${weeklyEmotion.count} kali minggu ini`
                : isEnglish
                  ? "Your emotional data will appear here"
                  : "Data emosionalmu akan muncul di sini"
            }
          />

          <OverviewCard
            icon={<TrendingUp className="h-5 w-5" />}
            title={isEnglish ? "This week" : "Minggu ini"}
            value={`${weeklyCheckins.length}/7`}
            description={
              isEnglish
                ? "Days with a completed check-in"
                : "Hari dengan check-in yang selesai"
            }
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                  <TrendingUp
                    className="h-4 w-4 text-indigo-600"
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {isEnglish
                      ? "Weekly Emotional Flow"
                      : "Alur Emosional Mingguan"}
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-400">
                    {isEnglish
                      ? "Your emotional journey this week"
                      : "Perjalanan emosionalmu minggu ini"}
                  </p>
                </div>
              </div>

              <Link
                href={`/${locale}/insights`}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                {isEnglish ? "View insights" : "Lihat insight"}
              </Link>
            </div>

            <div className="mt-8">
              <div className="flex h-52 items-end gap-3 border-b border-gray-100 px-2">
                {weeklyBars.map((item) => (
                  <div
                    key={item.key}
                    className="group flex h-full flex-1 items-end justify-center"
                  >
                    <div
                      className={`w-full max-w-10 rounded-t-lg transition-all duration-300 ${
                        item.checkin
                          ? "bg-indigo-200 group-hover:bg-indigo-300"
                          : "bg-gray-100"
                      }`}
                      style={{ height: `${item.height}%` }}
                      title={
                        item.checkin
                          ? `${item.checkin.emotions
                              .map((emotion) => emotion.name)
                              .join(", ")}`
                          : isEnglish
                            ? "No check-in"
                            : "Belum ada check-in"
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-7 text-center text-[11px] text-gray-400">
                {weeklyBars.map((item) => (
                  <span key={item.key}>{dayLabel(item.date)}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
              <Sparkles
                className="h-4 w-4 text-indigo-600"
                strokeWidth={1.8}
              />
            </div>

            <h3 className="mt-5 text-sm font-semibold text-gray-900">
              {isEnglish ? "AI Emotional Insight" : "AI Emotional Insight"}
            </h3>

            {todayAnalysis ? (
              <>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {todayAnalysis.summary}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <InsightMetric
                    label={isEnglish ? "Stress" : "Stres"}
                    value={
                      todayAnalysis.stressScore != null
                        ? `${todayAnalysis.stressScore}/100`
                        : "—"
                    }
                  />
                  <InsightMetric
                    label={isEnglish ? "State" : "Keadaan"}
                    value={todayAnalysis.emotionalState ?? "—"}
                  />
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <p className="text-sm leading-6 text-gray-500">
                  {isEnglish
                    ? "Your first AI insight will appear after you complete a check-in."
                    : "AI insight pertamamu akan muncul setelah kamu menyelesaikan check-in."}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <MessageCircle
                  className="h-4 w-4 text-gray-600"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {isEnglish ? "Latest Reflection" : "Refleksi Terakhir"}
                </h3>
                <p className="text-xs text-gray-400">
                  {isEnglish
                    ? "Your latest diary entry"
                    : "Catatan diary terakhirmu"}
                </p>
              </div>
            </div>

            {latestDiary ? (
              <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-5">
                <p className="line-clamp-4 text-sm leading-6 text-gray-600">
                  {latestDiary.content ||
                    (latestDiary.entryType === "VOICE"
                      ? isEnglish
                        ? "Voice reflection"
                        : "Refleksi suara"
                      : isEnglish
                        ? "Empty reflection"
                        : "Refleksi kosong")}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-gray-400">
                    {formatDate(latestDiary.createdAt)}
                  </span>

                  <Link
                    href={`/${locale}/diary`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    {isEnglish ? "View diary" : "Lihat diary"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-gray-200 p-5 text-center">
                <p className="text-sm text-gray-400">
                  {isEnglish ? "No reflection yet." : "Belum ada refleksi."}
                </p>

                <Link
                  href={`/${locale}/diary`}
                  className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  {isEnglish
                    ? "Write your first reflection"
                    : "Tulis refleksi pertamamu"}
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                <Clock3
                  className="h-4 w-4 text-indigo-600"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {isEnglish
                    ? "Recommended Activity"
                    : "Aktivitas Rekomendasi"}
                </h3>

                <p className="text-xs text-gray-400">
                  {isEnglish
                    ? "Something you can try today"
                    : "Sesuatu yang bisa kamu coba hari ini"}
                </p>
              </div>
            </div>

            {recommendedActivity ? (
              <div className="mt-6 rounded-xl bg-indigo-50/70 p-5">
                <p className="text-xs font-medium text-indigo-600">
                  {recommendedActivity.category}
                </p>

                <h4 className="mt-2 text-base font-semibold text-gray-900">
                  {recommendedActivity.title}
                </h4>

                <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-500">
                  {recommendedActivity.description}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-gray-500">
                    {recommendedActivity.durationMinutes}{" "}
                    {isEnglish ? "minutes" : "menit"}
                  </span>

                  <Link
                    href={`/${locale}/activities/${recommendedActivity.slug}`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    {isEnglish ? "Start activity" : "Mulai aktivitas"}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl bg-gray-50 p-5">
                <p className="text-sm text-gray-500">
                  {isEnglish
                    ? "No activity recommendation available yet."
                    : "Belum ada rekomendasi aktivitas."}
                </p>
              </div>
            )}

            <Link
              href={`/${locale}/activities`}
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {isEnglish ? "Explore all activities" : "Lihat semua aktivitas"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <CheckCircle2
                  className="h-5 w-5 text-gray-600"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {isEnglish
                    ? "Need a little extra support?"
                    : "Butuh dukungan tambahan?"}
                </h3>

                <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500">
                  {isEnglish
                    ? "Explore Moodify's support resources whenever you need a little more help."
                    : "Jelajahi sumber dukungan Moodify kapan pun kamu membutuhkan bantuan tambahan."}
                </p>
              </div>
            </div>

            <Link
              href={`/${locale}/support`}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 px-4 text-xs font-semibold text-gray-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              {isEnglish ? "Explore support" : "Lihat dukungan"}
            </Link>
          </div>
        </section>
      </div>
  );
}

function OverviewCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        {icon}
      </div>

      <p className="mt-5 text-xs font-medium text-gray-400">{title}</p>

      <p className="mt-1 truncate text-2xl font-bold tracking-tight text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
}

function InsightMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
 return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}
