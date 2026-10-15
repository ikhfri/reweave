/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";

/* =========================================================
   TYPES
========================================================= */

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
    nickname: string | null;
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
  meta?: {
    timezone?: string;
  };
  weekly: {
    startDate: string;
    endDate: string;
    checkins: Checkin[];
  };
};

/* =========================================================
   EMOTIONS HELPERS (Disesuaikan dengan halaman Emosi)
========================================================= */

const emotionArtwork: Record<string, string> = {
  happy: "/emotions-emoji/happy.webp",
  loved: "/emotions-emoji/loved.webp",
  excited: "/emotions-emoji/excited.webp",
  hopeful: "/emotions-emoji/hopefulrev.png",
  calm: "/emotions-emoji/calm.webp",
  tired: "/emotions-emoji/tired.webp",
  anxious: "/emotions-emoji/anxious.webp",
  stressed: "/emotions-emoji/stressed.webp",
  angry: "/emotions-emoji/angry.webp",
  lonely: "/emotions-emoji/lonely.webp",
  sad: "/emotions-emoji/sad.webp",
  overwhelmed: "/emotions-emoji/overwhelmed.webp",
};

const emotionColors: Record<string, string> = {
  happy: "#FBC4AB",
  loved: "#C39986",
  excited: "#8F7163",
  hopeful: "#D6E3D5",
  calm: "#B1C5B1",
  tired: "#879C87",
  anxious: "#D66F5A",
  stressed: "#A64D3B",
  angry: "#782E20",
  lonely: "#7182A4",
  sad: "#475677",
  overwhelmed: "#39405B",
};

// Kamus translasi nama emosi (ID / EN)
const emotionNamesMap: Record<string, { id: string; en: string }> = {
  happy: { id: "Senang", en: "Happy" },
  loved: { id: "Dicintai", en: "Loved" },
  excited: { id: "Antusias", en: "Excited" },
  hopeful: { id: "Bersyukur", en: "Hopeful" },
  calm: { id: "Tenang", en: "Calm" },
  tired: { id: "Lelah", en: "Tired" },
  anxious: { id: "Cemas", en: "Anxious" },
  stressed: { id: "Stres", en: "Stressed" },
  angry: { id: "Marah", en: "Angry" },
  lonely: { id: "Kesepian", en: "Lonely" },
  sad: { id: "Sedih", en: "Sad" },
  overwhelmed: { id: "Kewalahan", en: "Overwhelmed" },
};

function normalizeEmotionSlug(slug: string) {
  return slug.toLowerCase().trim().replace(/\s+/g, "-");
}

function getEmotionColor(slug: string) {
  const normalized = normalizeEmotionSlug(slug);
  return emotionColors[normalized] ?? "#C1D5C0";
}

// Fungsi untuk mendapatkan nama emosi sesuai bahasa
function getEmotionName(
  slug: string,
  fallbackName: string,
  isEnglish: boolean,
) {
  const normalized = normalizeEmotionSlug(slug);
  const translation = emotionNamesMap[normalized];
  if (!translation) return fallbackName;
  return isEnglish ? translation.en : translation.id;
}

function getEmotionArtwork(emotion: Emotion) {
  const slug = normalizeEmotionSlug(emotion.slug);
  return emotionArtwork[slug] ?? "/emotions-emoji/calm.webp";
}

function EmotionArtwork({
  emotion,
  size = 42,
  className = "",
}: {
  emotion: Emotion;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={getEmotionArtwork(emotion)}
      alt={emotion.name}
      width={size}
      height={size}
      className={`object-contain mix-blend-multiply ${className}`}
    />
  );
}

/* =========================================================
   ACTIVITIES HELPERS (Disesuaikan dengan halaman Aktivitas)
========================================================= */

const wellbeingTranslations: Record<
  string,
  {
    title: { en: string; id: string };
    description: { en: string; id: string };
  }
> = {
  "box breathing": {
    title: { en: "Box Breathing", id: "Pernapasan Kotak" },
    description: {
      en: "A simple breathing exercise that can help you slow down and create a moment of calm.",
      id: "Latihan pernapasan sederhana yang dapat membantumu rileks dan menciptakan momen ketenangan.",
    },
  },
  "gratitude journal": {
    title: { en: "Gratitude Journal", id: "Jurnal Rasa Syukur" },
    description: {
      en: "Reflect on a few things that you appreciate or that went well today.",
      id: "Renungkan beberapa hal yang kamu hargai atau yang berjalan dengan baik hari ini.",
    },
  },
  "grounding 5-4-3-2-1": {
    title: { en: "Grounding 5-4-3-2-1", id: "Teknik Grounding 5-4-3-2-1" },
    description: {
      en: "A grounding activity that brings your attention back to the present moment.",
      id: "Aktivitas grounding yang membawa kembali perhatianmu sepenuhnya ke masa kini.",
    },
  },
  "short walk": {
    title: { en: "Short Walk", id: "Jalan Kaki Sejenak" },
    description: {
      en: "Take a short mindful walk and give yourself some space away from your current environment.",
      id: "Luangkan waktu sejenak untuk berjalan santai dan beri ruang bagi dirimu dari penatnya lingkungan saat ini.",
    },
  },
  "progressive muscle relaxation": {
    title: {
      en: "Progressive Muscle Relaxation",
      id: "Relaksasi Otot Progresif",
    },
    description: {
      en: "A relaxation exercise involving gentle tensing and releasing of different muscle groups.",
      id: "Latihan relaksasi yang melibatkan ketegangan dan pelepasan lembut pada berbagai kelompok otot secara berurutan.",
    },
  },
};

function getWellbeingTitle(title: string | null | undefined, isId: boolean) {
  if (!title) return "";
  const translation = wellbeingTranslations[title.toLowerCase().trim()];
  return translation
    ? isId
      ? translation.title.id
      : translation.title.en
    : title;
}

function getWellbeingDescription(
  title: string | null | undefined,
  originalDesc: string | null | undefined,
  isId: boolean,
) {
  if (!title) return originalDesc || "";
  const translation = wellbeingTranslations[title.toLowerCase().trim()];
  return translation
    ? isId
      ? translation.description.id
      : translation.description.en
    : originalDesc || "";
}

function formatCategory(category: string, isId: boolean) {
  const value = category.toLowerCase();
  if (value.includes("breath")) {
    return isId ? "Pernapasan" : "Breathing";
  }
  if (value.includes("ground")) {
    return "Grounding";
  }
  if (value.includes("movement")) {
    return isId ? "Gerakan" : "Movement";
  }
  if (value.includes("reflection")) {
    return isId ? "Refleksi" : "Reflection";
  }
  if (value.includes("relax")) {
    return isId ? "Relaksasi" : "Relaxation";
  }
  return category;
}

function getDateKey(value: string | number | Date, timeZone = "Asia/Jakarta") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function getTodayDateKey(timeZone = "Asia/Jakarta") {
  return getDateKey(new Date(), timeZone);
}

/* =========================================================
   MAIN DASHBOARD COMPONENT
========================================================= */

export default function DashboardClient({
  locale,
  userName,
  nickname,
}: {
  locale: Locale;
  userName: string;
  nickname: string | null;
}) {
  const isEnglish = locale === "en";
  const isId = locale === "id";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const displayName =
    data?.user.nickname?.trim() || nickname?.trim() || userName.trim();

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
  const timeZone = data?.meta?.timezone || "Asia/Jakarta";

  const streak = useMemo(() => {
    const dates = new Set(
      weeklyCheckins.map((item) => getDateKey(item.date, timeZone)),
    );

    const cursorKey = getTodayDateKey(timeZone);
    const [year, month, day] = cursorKey.split("-").map(Number);
    const cursor = new Date(Date.UTC(year, month - 1, day));

    let count = 0;
    for (let i = 0; i < 30; i += 1) {
      const key = cursor.toISOString().slice(0, 10);
      if (!dates.has(key)) break;
      count += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return count;
  }, [weeklyCheckins, timeZone]);

  const weeklyBars = useMemo(() => {
    const todayKey = getTodayDateKey(timeZone);
    const [year, month, day] = todayKey.split("-").map(Number);
    const todayUtc = new Date(Date.UTC(year, month - 1, day));

    const checkinsByDate = new Map(
      weeklyCheckins.map((checkin) => [
        getDateKey(checkin.date, timeZone),
        checkin,
      ]),
    );

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(todayUtc);
      date.setUTCDate(todayUtc.getUTCDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      const checkin = checkinsByDate.get(key);

      const emotions = [...(checkin?.emotions ?? [])]
        .sort(
          (a, b) =>
            (b.intensity ?? checkin?.overallIntensity ?? 3) -
            (a.intensity ?? checkin?.overallIntensity ?? 3),
        )
        .slice(0, 3);

      return {
        key,
        date: new Date(`${key}T12:00:00`),
        checkin,
        emotions,
      };
    });
  }, [weeklyCheckins, timeZone]);

  const weeklyEmotion = useMemo(() => {
    const emotions = weeklyCheckins.flatMap((checkin) => checkin.emotions);

    if (!emotions.length) {
      return null;
    }

    const counts = new Map<
      string,
      {
        name: string;
        count: number;
      }
    >();

    for (const emotion of emotions) {
      const slug = normalizeEmotionSlug(emotion.slug);
      const current = counts.get(slug);

      counts.set(slug, {
        name: emotion.name,
        count: (current?.count ?? 0) + 1,
      });
    }

    return [...counts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([slug, value]) => ({
        slug,
        ...value,
      }))[0];
  }, [weeklyCheckins]);

  const weeklyEmotionLegend = useMemo(() => {
    const seen = new Map<string, Emotion>();

    for (const checkin of weeklyCheckins) {
      for (const emotion of checkin.emotions) {
        const slug = normalizeEmotionSlug(emotion.slug);

        if (!seen.has(slug)) {
          seen.set(slug, emotion);
        }
      }
    }

    return [...seen.values()];
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
    <main className="min-h-full bg-[#FDFBF7] pb-16 text-[#4A3F35]">
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <section>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
                {isEnglish ? "A moment for yourself" : "Sejenak untuk dirimu"}
              </p>

              <h1 className="mt-3 text-[34px] font-semibold leading-[1.12] tracking-[-0.045em] text-[#4A3F35] sm:text-[46px]">
                {getGreeting(isEnglish)}, {displayName}.
              </h1>

              <p className="mt-4 max-w-xl text-[14px] leading-7 text-[#4A3F35]/55 sm:text-[15px]">
                {isEnglish
                  ? "Notice what is happening inside you, without needing to judge it."
                  : "Perhatikan apa yang sedang kamu rasakan, tanpa harus menghakiminya."}
              </p>
            </div>

            <div className="hidden border-l border-[#4A3F35]/10 pl-5 md:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4A3F35]/30">
                {isEnglish ? "Today" : "Hari ini"}
              </p>

              <p className="mt-2 text-sm font-medium text-[#4A3F35]/65">
                {new Intl.DateTimeFormat(isEnglish ? "en-US" : "id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }).format(new Date())}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <section className="border-l-2 border-[#E2725B] bg-[#E2725B]/10 px-5 py-4">
            <p className="text-sm leading-6 text-[#4A3F35]">{error}</p>
          </section>
        )}

        <section className="relative overflow-hidden rounded-[28px] bg-[#FBC4AB]/40 px-6 py-8 sm:px-9 sm:py-10 lg:px-11 lg:py-12">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#FDFBF7]/50" />
          <div className="absolute -bottom-24 right-[20%] h-48 w-48 rounded-full bg-[#C1D5C0]/30" />

          <div className="relative max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5C6B9C]">
              {isEnglish ? "Daily check-in" : "Check-in harian"}
            </p>

            <h2 className="mt-5 max-w-2xl text-[28px] font-semibold leading-[1.2] tracking-[-0.035em] text-[#4A3F35] sm:text-[36px]">
              {data?.today.hasCheckin
                ? isEnglish
                  ? "You have already checked in today."
                  : "Kamu sudah check-in hari ini."
                : isEnglish
                  ? "How are you feeling right now?"
                  : "Bagaimana perasaanmu sekarang?"}
            </h2>

            <p className="mt-4 max-w-xl text-[14px] leading-7 text-[#4A3F35]/65">
              {data?.today.hasCheckin
                ? isEnglish
                  ? "Your thoughts are here whenever you want to look back, reflect, or add something new."
                  : "Catatanmu tersimpan di sini kapan pun kamu ingin melihat kembali, berefleksi, atau menambahkan sesuatu yang baru."
                : isEnglish
                  ? "There is no right answer. Choose whatever feels closest to what you are experiencing."
                  : "Tidak ada jawaban yang salah. Pilih emosi yang paling menggambarkan perasaanmu saat ini."}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href={`/${locale}/check-in`}
                className="flex h-11 w-full sm:w-auto items-center justify-center bg-[#E2725B] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#4A3F35]"
              >
                {data?.today.hasCheckin
                  ? isEnglish
                    ? "Check in again"
                    : "Check-in lagi"
                  : isEnglish
                    ? "Start check-in"
                    : "Mulai check-in"}
                <span aria-hidden="true" className="ml-3">
                  →
                </span>
              </Link>

              <Link
                href={`/${locale}/diary`}
                className="flex h-11 w-full sm:w-auto items-center justify-center border border-[#4A3F35]/15 bg-[#FDFBF7]/45 px-6 text-sm font-medium text-[#4A3F35] transition-colors hover:bg-[#FDFBF7]/75"
              >
                {isEnglish ? "Write a reflection" : "Tulis refleksi"}
              </Link>
            </div>
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow={isEnglish ? "Your week" : "Minggumu"}
            title={
              isEnglish
                ? "A small look at your rhythm."
                : "Mengenali ritme emosimu."
            }
          />

          <div className="mt-7 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            {/* STREAK */}
            <div className="relative overflow-hidden rounded-[24px] bg-[#5C6B9C] p-7 text-[#FDFBF7] sm:p-8">
              <div className="absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-[#FBC4AB]/15" />

              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-60">
                  {isEnglish ? "Check-in streak" : "Streak check-in"}
                </p>

                <div className="mt-9 flex items-end gap-2">
                  <span className="text-[52px] font-semibold leading-none tracking-[-0.06em]">
                    {loading ? "—" : streak}
                  </span>
                  <span className="mb-1.5 text-sm opacity-65">
                    {isEnglish ? "days" : "hari"}
                  </span>
                </div>

                <p className="mt-4 max-w-xs text-xs leading-6 opacity-65">
                  {streak > 0
                    ? isEnglish
                      ? "Small moments of checking in can become a meaningful rhythm."
                      : "Langkah kecil melalui check-in dapat membangun kebiasaan yang bermakna."
                    : isEnglish
                      ? "Your first check-in can start here."
                      : "Langkah pertamamu bisa dimulai dari sini."}
                </p>
              </div>
            </div>

            {/* MOST PRESENT EMOTION */}
            <div className="rounded-[24px] border border-[#C1D5C0]/60 bg-[#FDFBF7] p-7 sm:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4A3F35]/35">
                {isEnglish ? "Most prominent emotion" : "Emosi paling dominan"}
              </p>

              <div className="mt-4 flex items-end justify-between gap-5">
                <h3 className="text-[28px] font-semibold tracking-[-0.035em] text-[#4A3F35]">
                  {weeklyEmotion
                    ? getEmotionName(
                        weeklyEmotion.slug,
                        weeklyEmotion.name,
                        isEnglish,
                      )
                    : loading
                      ? "..."
                      : isEnglish
                        ? "No data yet"
                        : "Belum ada data"}
                </h3>

                {weeklyEmotion && (
                  <span className="text-sm font-medium text-[#4A3F35]/40">
                    {weeklyEmotion.count}×
                  </span>
                )}
              </div>

              <div className="mt-8 flex gap-1.5">
                {Array.from({ length: 7 }).map((_, index) => {
                  const filled = index < Math.min(7, weeklyEmotion?.count ?? 0);
                  return (
                    <span
                      key={index}
                      className={[
                        "h-1.5 flex-1 rounded-full",
                        filled ? "bg-[#E2725B]" : "bg-[#C1D5C0]/35",
                      ].join(" ")}
                    />
                  );
                })}
              </div>

              <p className="mt-4 text-xs leading-5 text-[#4A3F35]/45">
                {weeklyEmotion
                  ? isEnglish
                    ? `Logged ${weeklyEmotion.count} ${weeklyEmotion.count === 1 ? "time" : "times"} in your check-ins this week.`
                    : `Dirasakan ${weeklyEmotion.count} kali dalam check-in minggu ini.`
                  : isEnglish
                    ? "Your emotional patterns for this week will appear here."
                    : "Pola emosimu minggu ini akan muncul di sini."}
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-5">
            <SectionHeading
              eyebrow={isEnglish ? "Seven day view" : "Tujuh hari terakhir"}
              title={isEnglish ? "Your emotional rhythm." : "Ritme emosimu."}
            />

            <Link
              href={`/${locale}/insights`}
              className="hidden text-xs font-semibold text-[#5C6B9C] transition-opacity hover:opacity-70 sm:block"
            >
              {isEnglish ? "See insights" : "Lihat insight"} →
            </Link>
          </div>

          <div className="mt-7 border-y border-[#C1D5C0]/50 bg-[#FDFBF7] px-2 py-10 sm:px-6">
            {/* GRAPH - Tambahkan pt-12 agar ada ruang untuk gambar webp di atas bar */}
            <div className="overflow-x-auto pt-12 pb-5">
              <div className="flex min-w-140 items-end gap-4">
                {weeklyBars.map((item) => {
                  const emotions = [...item.emotions]
                    .sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0))
                    .slice(0, 3);

                  return (
                    <div
                      key={item.key}
                      className="flex min-w-0 flex-1 flex-col items-center"
                    >
                      {/* BAR AREA */}
                      <div className="relative flex h-57.5 w-full items-end justify-center border-b border-[#4A3F35]/10">
                        {emotions.length > 0 ? (
                          <div className="flex h-full w-full max-w-29.5 items-end justify-center gap-2">
                            {emotions.map((emotion) => {
                              const intensity = Math.max(
                                1,
                                Math.min(
                                  5,
                                  emotion.intensity ??
                                    item.checkin?.overallIntensity ??
                                    3,
                                ),
                              );

                              // Skala tinggi bar dibatasi maks 75% agar tidak keluar batas atas
                              const height = Math.max(
                                16,
                                Math.min(75, intensity * 15),
                              );
                              const color = getEmotionColor(emotion.slug);

                              return (
                                <div
                                  key={`${item.key}-${emotion.slug}`}
                                  className="group relative flex h-full max-w-8.5 flex-1 items-end justify-center"
                                  title={`${getEmotionName(emotion.slug, emotion.name, isEnglish)} · ${intensity}/5`}
                                >
                                  {/* GAMBAR webp EMOSI */}
                                  <div
                                    className="absolute left-1/2 z-10 flex w-6.5 -translate-x-1/2 items-center justify-center transition-transform duration-200 group-hover:-translate-y-1 sm:w-8"
                                    style={{
                                      bottom: `calc(${height}% + 6px)`,
                                    }}
                                  >
                                    <EmotionArtwork
                                      emotion={emotion}
                                      size={28}
                                    />
                                  </div>

                                  {/* BAR WARNA */}
                                  <div
                                    className="w-full rounded-t-[9px] transition-all duration-300 group-hover:brightness-95"
                                    style={{
                                      height: `${height}%`,
                                      backgroundColor: color,
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mb-0 h-1.5 w-9 rounded-full bg-[#C1D5C0]/35" />
                        )}
                      </div>

                      {/* HARI */}
                      <span className="mt-8 text-[10px] font-medium text-[#4A3F35]/40">
                        {dayLabel(item.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LEGENDA EMOSI - Menggunakan getEmotionName untuk translasi */}
            {weeklyEmotionLegend.length > 0 && (
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-[#4A3F35]/6 pt-6">
                {weeklyEmotionLegend.map((emotion) => (
                  <div key={emotion.slug} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getEmotionColor(emotion.slug) }}
                    />
                    <span className="text-[9px] font-medium text-[#4A3F35]/45">
                      {getEmotionName(emotion.slug, emotion.name, isEnglish)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-7 lg:grid-cols-[1.2fr_0.8fr]">
          {/* DIARY */}
          <div className="border-t border-[#C1D5C0]/60 pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4A3F35]/35">
              {isEnglish ? "From your diary" : "Dari diary-mu"}
            </p>

            <div className="mt-3 flex items-end justify-between gap-5">
              <h3 className="text-[25px] font-semibold tracking-[-0.03em]">
                {isEnglish ? "A recent thought." : "Catatan terbarumu."}
              </h3>

              {latestDiary && (
                <Link
                  href={`/${locale}/diary`}
                  className="text-xs font-semibold text-[#5C6B9C]"
                >
                  {isEnglish ? "Open diary" : "Buka diary"}
                </Link>
              )}
            </div>

            {latestDiary ? (
              <div className="mt-8">
                <div className="border-l-2 border-[#E2725B] pl-5">
                  <p className="line-clamp-5 text-[15px] leading-8 text-[#4A3F35]/75">
                    &quot;
                    {latestDiary.content ||
                      (latestDiary.entryType === "VOICE"
                        ? isEnglish
                          ? "Voice reflection"
                          : "Refleksi suara"
                        : isEnglish
                          ? "Empty reflection"
                          : "Refleksi kosong")}
                    &quot;
                  </p>
                </div>
                <p className="mt-5 text-[10px] font-medium uppercase tracking-widest text-[#4A3F35]/30">
                  {formatDate(latestDiary.createdAt)}
                </p>
              </div>
            ) : (
              <div className="mt-7 border-y border-dashed border-[#C1D5C0] py-8">
                <p className="text-sm text-[#4A3F35]/50">
                  {isEnglish
                    ? "Nothing written here yet."
                    : "Belum ada refleksi di sini."}
                </p>
                <Link
                  href={`/${locale}/diary`}
                  className="mt-4 inline-block text-xs font-semibold text-[#5C6B9C]"
                >
                  {isEnglish
                    ? "Write your first reflection"
                    : "Tulis refleksi pertamamu"}{" "}
                  →
                </Link>
              </div>
            )}
          </div>

          {/* AI REFLECTION */}
          <div className="bg-[#FBC4AB]/30 p-7 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5C6B9C]">
              {isEnglish ? "A little reflection" : "Refleksi sejenak"}
            </p>

            {todayAnalysis ? (
              <div className="mt-6">
                <p className="text-[15px] leading-8 text-[#4A3F35]/75">
                  {todayAnalysis.summary}
                </p>
                <div className="mt-7 border-t border-[#4A3F35]/10 pt-5">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-[#4A3F35]/35">
                    {isEnglish ? "Emotional state" : "Kondisi emosional"}
                  </p>
                  <p className="mt-2 text-sm font-semibold capitalize text-[#4A3F35]">
                    {todayAnalysis.emotionalState ?? "—"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-[15px] leading-8 text-[#4A3F35]/65">
                  {isEnglish
                    ? "Once you complete a check-in, your reflection will appear here."
                    : "Refleksi harianmu akan muncul di sini setelah kamu menyelesaikan check-in."}
                </p>
                <Link
                  href={`/${locale}/check-in`}
                  className="mt-5 inline-block text-xs font-semibold text-[#5C6B9C]"
                >
                  {isEnglish ? "Start a check-in" : "Mulai check-in"} →
                </Link>
              </div>
            )}
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow={isEnglish ? "For you" : "Untukmu"}
            title={
              isEnglish
                ? "Something gentle to try."
                : "Langkah kecil yang bisa dicoba."
            }
          />

          <div className="mt-7">
            {recommendedActivity ? (
              <div className="border-y border-[#C1D5C0]/55 py-7">
                <div className="grid gap-7 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C6B9C]">
                        {formatCategory(recommendedActivity.category, isId)}
                      </span>

                      <span className="h-1 w-1 rounded-full bg-[#C1D5C0]" />

                      <span className="text-[10px] text-[#4A3F35]/40">
                        {recommendedActivity.durationMinutes}{" "}
                        {isEnglish ? "min" : "menit"}
                      </span>
                    </div>

                    <h3 className="mt-3 text-[23px] font-semibold tracking-tight">
                      {getWellbeingTitle(recommendedActivity.title, isId)}
                    </h3>

                    <p className="mt-2 max-w-xl text-sm leading-7 text-[#4A3F35]/55">
                      {getWellbeingDescription(
                        recommendedActivity.title,
                        recommendedActivity.description,
                        isId,
                      )}
                    </p>
                  </div>

                  <Link
                    href={`/${locale}/activities/${recommendedActivity.slug}`}
                    className="inline-flex h-11 items-center justify-center bg-[#E2725B] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#4A3F35]"
                  >
                    {isEnglish ? "Try this" : "Coba ini"} →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="border-y border-dashed border-[#C1D5C0] py-9">
                <p className="text-sm text-[#4A3F35]/50">
                  {isEnglish
                    ? "No activity recommendation available yet."
                    : "Belum ada rekomendasi aktivitas."}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-[#C1D5C0]/50 pt-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#4A3F35]">
                {isEnglish
                  ? "You don't have to handle everything alone."
                  : "Kamu tidak harus menghadapi semuanya sendirian."}
              </p>
              <p className="mt-2 max-w-xl text-xs leading-5 text-[#4A3F35]/45">
                {isEnglish
                  ? "Support resources are available whenever you need them."
                  : "Sumber dukungan tersedia kapan pun kamu membutuhkannya."}
              </p>
            </div>

            <Link
              href={`/${locale}/support`}
              className="shrink-0 text-xs font-semibold text-[#5C6B9C]"
            >
              {isEnglish ? "Explore support" : "Lihat dukungan"} →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5C6B9C]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-[23px] font-semibold tracking-[-0.03em] text-[#4A3F35] sm:text-[25px]">
        {title}
      </h2>
    </div>
  );
}

function getGreeting(isEnglish: boolean) {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return isEnglish ? "Good morning" : "Selamat pagi";
  }
  if (hour >= 12 && hour < 18) {
    return isEnglish ? "Good afternoon" : "Selamat siang";
  }
  return isEnglish ? "Good evening" : "Selamat malam";
}
