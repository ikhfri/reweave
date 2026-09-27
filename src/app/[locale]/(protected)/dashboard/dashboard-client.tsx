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
      <div className="space-y-10 bg-[#fdfbf7] pb-12">
        {/* Header Section */}
        <section className="pt-6">
          <p className="text-sm font-semibold tracking-wide text-[#5c6b9c] uppercase">
            {isEnglish ? "Good to see you" : "Senang melihatmu lagi"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#4a3f35] sm:text-4xl">
            {isEnglish
              ? `Good morning, ${userName}.`
              : `Selamat pagi, ${userName}.`}
          </h1>
          <p className="mt-2 text-base text-[#4a3f35]/70">
            {isEnglish
              ? "Take a moment to check in with yourself today."
              : "Luangkan sedikit waktu untuk memahami perasaanmu hari ini."}
          </p>
        </section>

        {error && (
          <section className="border-l-4 border-[#e2725b] bg-[#e2725b]/10 p-4">
            <p className="text-sm font-medium text-[#e2725b]">{error}</p>
          </section>
        )}

        {/* Hero Check-in Banner */}
        <section className="bg-[#FDE7DD] p-6 sm:p-8 rounded-lg">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-[#4A3F35]" strokeWidth={2} />
              <p className="text-sm font-semibold text-[#4A3F35]">
                {isEnglish
                  ? "Daily Emotional Check-in"
                  : "Check-in Emosional Harian"}
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-[#4A3F35] sm:text-3xl">
              {data?.today.hasCheckin
                ? isEnglish
                  ? "You've checked in today."
                  : "Kamu sudah check-in hari ini."
                : isEnglish
                  ? "How are you feeling today?"
                  : "Bagaimana perasaanmu hari ini?"}
            </h2>

            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#4A3F35]/90">
              {data?.today.hasCheckin
                ? isEnglish
                  ? "Your emotional check-in is saved. You can review the insight or add another reflection."
                  : "Check-in emosionalmu sudah tersimpan. Kamu bisa melihat insight atau menambahkan refleksi."
                : isEnglish
                  ? "A quick check-in can help you notice how you're feeling and build a better understanding of your emotional patterns."
                  : "Check-in singkat dapat membantu kamu menyadari perasaanmu dan memahami pola emosionalmu dari waktu ke waktu."}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={`/${locale}/check-in`}
                className="inline-flex h-10 items-center gap-2 bg-[#e2725b] px-6 text-sm font-semibold text-[#fdfbf7] transition-colors hover:bg-[#c9624d] rounded-md"
              >
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
                className="inline-flex h-10 items-center gap-2 border border-[#fdfbf7]/30 bg-transparent px-6 text-sm font-semibold text-[#fdfbf7] transition-colors hover:bg-[#fdfbf7]/10 rounded-md"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={2} />
                {isEnglish ? "Write a reflection" : "Tulis refleksi"}
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid gap-4 sm:grid-cols-3">
          <OverviewCard
            icon={<CalendarDays className="h-5 w-5 text-[#5c6b9c]" />}
            title={isEnglish ? "Check-in streak" : "Streak check-in"}
            value={`${streak} ${isEnglish ? "days" : "hari"}`}
            description={
              streak > 0
                ? isEnglish
                  ? "Keep building your rhythm"
                  : "Jaga ritmemu"
                : isEnglish
                  ? "Start your first check-in"
                  : "Mulai check-in pertamamu"
            }
          />
          <OverviewCard
            icon={<Activity className="h-5 w-5 text-[#e2725b]" />}
            title={isEnglish ? "Dominant emotion" : "Emosi dominan"}
            value={
              weeklyEmotion?.name ??
              (loading ? "..." : "—")
            }
            description={
              weeklyEmotion
                ? isEnglish
                  ? `Appeared ${weeklyEmotion.count} times this week`
                  : `Muncul ${weeklyEmotion.count} kali minggu ini`
                : isEnglish
                  ? "No data available yet"
                  : "Belum ada data"
            }
          />
          <OverviewCard
            icon={<TrendingUp className="h-5 w-5 text-[#c1d5c0]" />}
            title={isEnglish ? "This week" : "Minggu ini"}
            value={`${weeklyCheckins.length} / 7`}
            description={
              isEnglish
                ? "Completed check-ins"
                : "Check-in selesai"
            }
          />
        </section>

        {/* Main Dashboard Content */}
        <section className="grid gap-6 lg:grid-cols-3">
          
          {/* Weekly Flow Chart - Takes up 2 columns */}
          <div className="lg:col-span-2 rounded-lg border border-[#c1d5c0]/70 bg-white p-6">
            <div className="flex items-center justify-between border-b border-[#c1d5c0]/40 pb-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-[#4a3f35]">
                  {isEnglish ? "Weekly Emotional Flow" : "Alur Emosi Mingguan"}
                </h3>
                <p className="mt-1 text-sm text-[#4a3f35]/60">
                  {isEnglish
                    ? "Your emotional intensity over the last 7 days"
                    : "Intensitas emosionalmu 7 hari terakhir"}
                </p>
              </div>
              <Link
                href={`/${locale}/insights`}
                className="text-sm font-semibold text-[#5c6b9c] hover:underline"
              >
                {isEnglish ? "View all insights" : "Lihat semua insight"}
              </Link>
            </div>

            <div className="flex h-56 items-end gap-2 sm:gap-4 mt-4">
              {weeklyBars.map((item) => (
                <div
                  key={item.key}
                  className="group flex h-full flex-1 flex-col items-center justify-end"
                >
                  <div
                    className={`w-full max-w-12 transition-all duration-300 rounded-t-sm ${
                      item.checkin
                        ? "bg-[#e2725b]/80 hover:bg-[#e2725b]"
                        : "bg-[#c1d5c0]/30"
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
                  <span className="mt-3 text-xs font-medium text-[#4a3f35]/60">
                    {dayLabel(item.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight Sidebar */}
          <div className="rounded-lg border border-[#c1d5c0]/70 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#5c6b9c]" strokeWidth={2} />
              <h3 className="text-base font-bold text-[#4a3f35]">
                {isEnglish ? "AI Insight" : "Insight AI"}
              </h3>
            </div>

            {todayAnalysis ? (
              <div className="flex flex-col h-full">
                <p className="text-sm leading-relaxed text-[#4a3f35]">
                  {todayAnalysis.summary}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#c1d5c0]/40 pt-6">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[#4a3f35]/50">
                      {isEnglish ? "Stress Level" : "Tingkat Stres"}
                    </p>
                    <p className="mt-1 text-lg font-bold text-[#4a3f35]">
                      {todayAnalysis.stressScore != null
                        ? `${todayAnalysis.stressScore}/100`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[#4a3f35]/50">
                      {isEnglish ? "State" : "Kondisi"}
                    </p>
                    <p className="mt-1 text-lg font-bold text-[#4a3f35] capitalize">
                      {todayAnalysis.emotionalState ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 bg-[#fdfbf7] border border-[#c1d5c0]/30 p-4 rounded-md">
                <p className="text-sm text-[#4a3f35]/70">
                  {isEnglish
                    ? "Your first AI insight will appear after you complete a check-in."
                    : "Insight AI pertamamu akan muncul setelah kamu menyelesaikan check-in."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Two Column Bottom Layout */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Latest Reflection */}
          <div className="rounded-lg border border-[#c1d5c0]/70 bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#4a3f35]" />
                <h3 className="text-base font-bold text-[#4a3f35]">
                  {isEnglish ? "Latest Reflection" : "Refleksi Terakhir"}
                </h3>
              </div>
              {latestDiary && (
                <Link
                  href={`/${locale}/diary`}
                  className="text-sm font-semibold text-[#5c6b9c] hover:underline"
                >
                  {isEnglish ? "View diary" : "Lihat diary"}
                </Link>
              )}
            </div>

            {latestDiary ? (
              <div className="bg-[#fdfbf7] p-4 rounded-md border-l-2 border-[#5c6b9c]">
                <p className="line-clamp-3 text-sm leading-relaxed text-[#4a3f35]">
                  &quot;{latestDiary.content ||
                    (latestDiary.entryType === "VOICE"
                      ? isEnglish
                        ? "Voice reflection"
                        : "Refleksi suara"
                      : isEnglish
                        ? "Empty reflection"
                        : "Refleksi kosong")}&quot;
                </p>
                <span className="mt-3 block text-xs font-medium text-[#4a3f35]/50">
                  {formatDate(latestDiary.createdAt)}
                </span>
              </div>
            ) : (
              <div className="border border-dashed border-[#c1d5c0] p-6 text-center rounded-md">
                <p className="text-sm text-[#4a3f35]/60 mb-2">
                  {isEnglish ? "No reflections yet." : "Belum ada refleksi."}
                </p>
                <Link
                  href={`/${locale}/diary`}
                  className="text-sm font-semibold text-[#5c6b9c] hover:underline"
                >
                  {isEnglish
                    ? "Write your first reflection"
                    : "Tulis refleksi pertamamu"}
                </Link>
              </div>
            )}
          </div>

          {/* Recommended Activity */}
          <div className="rounded-lg border border-[#c1d5c0]/70 bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-[#4a3f35]" />
                <h3 className="text-base font-bold text-[#4a3f35]">
                  {isEnglish ? "Up Next" : "Selanjutnya"}
                </h3>
              </div>
              <Link
                href={`/${locale}/activities`}
                className="flex items-center gap-1 text-sm font-semibold text-[#5c6b9c] hover:underline"
              >
                {isEnglish ? "All activities" : "Semua aktivitas"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {recommendedActivity ? (
              <div className="bg-[#fbc4ab]/20 p-4 rounded-md border border-[#fbc4ab]/40">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e2725b]">
                    {recommendedActivity.category}
                  </span>
                  <span className="text-xs font-medium text-[#4a3f35]/60">
                    {recommendedActivity.durationMinutes} {isEnglish ? "min" : "menit"}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-[#4a3f35] mb-1">
                  {recommendedActivity.title}
                </h4>
                <p className="text-sm text-[#4a3f35]/80 mb-4 line-clamp-2">
                  {recommendedActivity.description}
                </p>
                <Link
                  href={`/${locale}/activities/${recommendedActivity.slug}`}
                  className="inline-flex h-9 items-center justify-center bg-white border border-[#c1d5c0] px-4 text-sm font-semibold text-[#4a3f35] transition-colors hover:bg-gray-50 rounded-md"
                >
                  {isEnglish ? "Start activity" : "Mulai aktivitas"}
                </Link>
              </div>
            ) : (
              <div className="bg-[#fdfbf7] p-4 rounded-md border border-[#c1d5c0]/30 text-center">
                <p className="text-sm text-[#4a3f35]/60">
                  {isEnglish
                    ? "No activity recommendation available yet."
                    : "Belum ada rekomendasi aktivitas."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Support Banner */}
        <section className="rounded-lg border border-[#c1d5c0]/70 bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-6 w-6 text-[#5c6b9c] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-[#4a3f35]">
                {isEnglish
                  ? "Need a little extra support?"
                  : "Butuh dukungan tambahan?"}
              </h3>
              <p className="mt-1 text-sm text-[#4a3f35]/70">
                {isEnglish
                  ? "Explore Moodify's support resources whenever you need a little more help."
                  : "Jelajahi sumber dukungan Moodify kapan pun kamu membutuhkan bantuan."}
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/support`}
            className="shrink-0 inline-flex h-10 items-center justify-center bg-[#fdfbf7] border border-[#c1d5c0] px-5 text-sm font-semibold text-[#4a3f35] transition-colors hover:bg-gray-50 rounded-md"
          >
            {isEnglish ? "Explore support" : "Lihat dukungan"}
          </Link>
        </section>
      </div>
  );
}

// Komponen dipersingkat agar lebih padat
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
    <div className="rounded-lg border border-[#c1d5c0]/70 bg-white p-5 flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-sm font-semibold text-[#4a3f35]">{title}</h3>
      </div>
      <div>
        <p className="text-2xl font-bold text-[#4a3f35]">{value}</p>
        <p className="mt-1 text-xs text-[#4a3f35]/60">{description}</p>
      </div>
    </div>
  );
}