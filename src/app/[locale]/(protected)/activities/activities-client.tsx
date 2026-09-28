/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  Footprints,
  Heart,
  Loader2,
  Sparkles,
  Wind,
} from "lucide-react";

import type { Locale } from "@/i18n/config";

type Activity = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  durationMinutes: number;
  difficulty: "EASY" | "MODERATE" | "ADVANCED";
  instructions: string;
  recommendationScore?: number;
};

type ActivityLog = {
  id: string;
  completed: boolean;
  userRating: number | null;
  userFeedback: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  activity: {
    id: string;
    title: string;
    slug: string;
    category: string;
    durationMinutes: number;
    difficulty: "EASY" | "MODERATE" | "ADVANCED";
  };
};

type ActivitiesClientProps = {
  locale: Locale;
  userName: string;
};

const categoryIcons: Record<string, typeof Wind> = {
  breathing: Wind,
  breath: Wind,
  grounding: Brain,
  ground: Brain,
  movement: Footprints,
  reflection: Heart,
  relaxation: Sparkles,
};

function getCategoryIcon(category: string) {
  const key = category.toLowerCase();

  const match = Object.keys(categoryIcons).find((item) =>
    key.includes(item),
  );

  return match ? categoryIcons[match] : Sparkles;
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

function formatDifficulty(
  difficulty: Activity["difficulty"],
  isId: boolean,
) {
  const labels = {
    EASY: isId ? "Mudah" : "Easy",
    MODERATE: isId ? "Sedang" : "Moderate",
    ADVANCED: isId ? "Lanjutan" : "Advanced",
  };

  return labels[difficulty];
}

function getActivityMood(
  activity: Activity,
  isId: boolean,
) {
  const category = activity.category.toLowerCase();

  if (
    category.includes("breath") ||
    category.includes("relax")
  ) {
    return isId
      ? "Untuk menenangkan diri"
      : "For slowing down";
  }

  if (
    category.includes("ground") ||
    category.includes("grounding")
  ) {
    return isId
      ? "Untuk kembali ke saat ini"
      : "For coming back to the present";
  }

  if (category.includes("movement")) {
    return isId
      ? "Untuk menggerakkan tubuh"
      : "For getting your body moving";
  }

  if (category.includes("reflection")) {
    return isId
      ? "Untuk memahami perasaan"
      : "For understanding yourself";
  }

  return isId
    ? "Untuk dirimu hari ini"
    : "For where you are today";
}

export default function ActivitiesClient({
  locale,
  userName,
}: ActivitiesClientProps) {
  const isId = locale === "id";

  const [activities, setActivities] = useState<Activity[]>([]);
  const [recommended, setRecommended] = useState<Activity[]>([]);
  const [history, setHistory] = useState<ActivityLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    const values = activities.map(
      (activity) => activity.category,
    );

    return [
      "all",
      ...Array.from(new Set(values)),
    ];
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (activeCategory === "all") {
      return activities;
    }

    return activities.filter(
      (activity) =>
        activity.category === activeCategory,
    );
  }, [activities, activeCategory]);

  const featuredActivity =
    recommended[0] ?? activities[0] ?? null;

  const otherRecommended = recommended.slice(1);

  useEffect(() => {
    let cancelled = false;

    async function loadActivities() {
      try {
        setLoading(true);
        setError("");

        const [
          activitiesResponse,
          recommendedResponse,
          historyResponse,
        ] = await Promise.all([
          fetch("/api/activities", {
            credentials: "include",
          }),

          fetch("/api/activities/recommended", {
            credentials: "include",
          }),

          fetch("/api/activities/history", {
            credentials: "include",
          }),
        ]);

        if (!activitiesResponse.ok) {
          throw new Error(
            "Failed to load activities",
          );
        }

        const activitiesData =
          await activitiesResponse.json();

        const recommendedData =
          recommendedResponse.ok
            ? await recommendedResponse.json()
            : { activities: [] };

        const historyData =
          historyResponse.ok
            ? await historyResponse.json()
            : { logs: [] };

        if (cancelled) return;

        setActivities(
          Array.isArray(
            activitiesData.activities,
          )
            ? activitiesData.activities
            : [],
        );

        setRecommended(
          Array.isArray(
            recommendedData.activities,
          )
            ? recommendedData.activities
            : [],
        );

        setHistory(
          Array.isArray(historyData.logs)
            ? historyData.logs
            : [],
        );
      } catch (err) {
        if (cancelled) return;

        console.error(err);

        setError(
          isId
            ? "Gagal memuat aktivitas."
            : "Failed to load activities.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadActivities();

    return () => {
      cancelled = true;
    };
  }, [isId]);

  if (loading) {
    return (
      <main className="min-h-full bg-[#fdfbf7] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[65vh] max-w-6xl items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fbc4ab]/35">
              <Loader2 className="h-5 w-5 animate-spin text-[#5c6b9c]" />
            </div>

            <p className="text-sm font-medium text-[#4a3f35]">
              {isId
                ? "Menyiapkan ruang untukmu..."
                : "Preparing something for you..."}
            </p>

            <p className="mt-1 text-xs text-[#4a3f35]/45">
              {isId
                ? "Sebentar."
                : "Just a moment."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-[#fdfbf7] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">

        {/* ================================================= */}
        {/* INTRO                                             */}
        {/* ================================================= */}

        <header className="mb-12">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#5c6b9c]">
              {isId
                ? "Ruang untuk dirimu"
                : "A space for you"}
            </p>

            <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#4a3f35] sm:text-4xl">
              {isId
                ? `Pelan-pelan juga tetap bergerak, ${userName}.`
                : `You don't have to rush, ${userName}.`}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#4a3f35]/60 sm:text-[15px]">
              {isId
                ? "Pilih satu hal kecil yang terasa cocok dengan keadaanmu sekarang. Tidak perlu menyelesaikan semuanya."
                : "Choose one small thing that feels right for where you are right now. You don't have to do everything."}
            </p>
          </div>
        </header>

        {/* ================================================= */}
        {/* ERROR                                             */}
        {/* ================================================= */}

        {error && (
          <div className="mb-8 border-l-2 border-[#e2725b] bg-[#fbc4ab]/15 px-4 py-3">
            <p className="text-sm text-[#4a3f35]/75">
              {error}
            </p>
          </div>
        )}

        {/* ================================================= */}
        {/* FEATURED                                          */}
        {/* ================================================= */}

        {featuredActivity && (
          <section className="mb-14">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5c6b9c]">
                {recommended.length > 0
                  ? isId
                    ? "Pilihan untukmu"
                    : "A thought for you"
                  : isId
                    ? "Mulai dari sini"
                    : "Start here"}
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#4a3f35]">
                {isId
                  ? "Satu aktivitas kecil"
                  : "One small thing"}
              </h2>
            </div>

            <article className="relative overflow-hidden rounded-[2rem] bg-[#fbc4ab]/35 p-6 sm:p-8 lg:p-10">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#fdfbf7]/40" />

              <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-[#c1d5c0]/30" />

              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fdfbf7]/80">
                      {(() => {
                        const Icon = getCategoryIcon(
                          featuredActivity.category,
                        );

                        return (
                          <Icon className="h-5 w-5 text-[#5c6b9c]" />
                        );
                      })()}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c6b9c]">
                        {formatCategory(
                          featuredActivity.category,
                          isId,
                        )}
                      </p>

                      <p className="mt-0.5 text-xs text-[#4a3f35]/50">
                        {getActivityMood(
                          featuredActivity,
                          isId,
                        )}
                      </p>
                    </div>
                  </div>

                  <h3 className="mt-7 text-2xl font-semibold tracking-tight text-[#4a3f35] sm:text-3xl">
                    {featuredActivity.title}
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-[#4a3f35]/65">
                    {featuredActivity.description}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#4a3f35]/55">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      {featuredActivity.durationMinutes}{" "}
                      {isId ? "menit" : "min"}
                    </span>

                    <span>
                      {formatDifficulty(
                        featuredActivity.difficulty,
                        isId,
                      )}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/${locale}/activities/${featuredActivity.slug}`}
                  className="group inline-flex w-fit items-center gap-2 rounded-full bg-[#4a3f35] px-5 py-3 text-sm font-medium text-[#fdfbf7] transition hover:bg-[#5c6b9c]"
                >
                  {isId ? "Mulai sekarang" : "Begin"}

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          </section>
        )}

        {/* ================================================= */}
        {/* OTHER RECOMMENDATIONS                             */}
        {/* ================================================= */}

        {otherRecommended.length > 0 && (
          <section className="mb-14">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5c6b9c]">
                {isId
                  ? "Pilihan lainnya"
                  : "A few more"}
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[#4a3f35]">
                {isId
                  ? "Kalau kamu ingin mencoba sesuatu yang lain"
                  : "If you'd like to try something else"}
              </h2>
            </div>

            <div className="grid gap-x-8 gap-y-0 md:grid-cols-2">
              {otherRecommended.slice(0, 4).map(
                (activity, index) => (
                  <RecommendedRow
                    key={activity.id}
                    activity={activity}
                    locale={locale}
                    index={index}
                  />
                ),
              )}
            </div>
          </section>
        )}

        {/* ================================================= */}
        {/* EXPLORE                                          */}
        {/* ================================================= */}

        <section className="mb-14">
          <div className="mb-7 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5c6b9c]">
              {isId
                ? "Jelajahi"
                : "Explore"}
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#4a3f35]">
              {isId
                ? "Temukan yang terasa pas"
                : "Find what feels right"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#4a3f35]/55">
              {isId
                ? "Tidak ada pilihan yang paling benar. Pilih berdasarkan apa yang kamu butuhkan sekarang."
                : "There is no perfect choice. Pick based on what you need right now."}
            </p>
          </div>

          {/* CATEGORY FILTER */}

          <div className="mb-8 flex gap-5 overflow-x-auto border-b border-[#4a3f35]/10 pb-3">
            {categories.map((category) => {
              const selected =
                activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setActiveCategory(category)
                  }
                  className={[
                    "relative shrink-0 pb-2 text-sm transition",
                    selected
                      ? "font-semibold text-[#4a3f35]"
                      : "text-[#4a3f35]/45 hover:text-[#4a3f35]/75",
                  ].join(" ")}
                >
                  {category === "all"
                    ? isId
                      ? "Semua"
                      : "All"
                    : formatCategory(
                        category,
                        isId,
                      )}

                  {selected && (
                    <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 rounded-full bg-[#e2725b]" />
                  )}
                </button>
              );
            })}
          </div>

          {filteredActivities.length === 0 ? (
            <div className="border-l-2 border-[#c1d5c0] py-4 pl-5">
              <p className="text-sm text-[#4a3f35]/55">
                {isId
                  ? "Belum ada aktivitas pada kategori ini."
                  : "No activities found in this category."}
              </p>
            </div>
          ) : (
            <div className="grid gap-x-8 gap-y-0 md:grid-cols-2">
              {filteredActivities.map(
                (activity, index) => (
                  <ExploreActivityRow
                    key={activity.id}
                    activity={activity}
                    locale={locale}
                    index={index}
                  />
                ),
              )}
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* HISTORY                                           */}
        {/* ================================================= */}

        <section className="border-t border-[#4a3f35]/10 pt-10">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5c6b9c]">
              {isId
                ? "Jejakmu"
                : "Your little record"}
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#4a3f35]">
              {isId
                ? "Yang sudah kamu lakukan"
                : "What you've already tried"}
            </h2>
          </div>

          {history.length === 0 ? (
            <div className="max-w-2xl border-l-2 border-[#fbc4ab] pl-5">
              <div className="flex items-center gap-2 text-[#5c6b9c]">
                <CheckCircle2 className="h-4 w-4" />

                <span className="text-sm font-medium">
                  {isId
                    ? "Belum ada riwayat"
                    : "No history yet"}
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-[#4a3f35]/50">
                {isId
                  ? "Setelah kamu menyelesaikan aktivitas, ceritanya akan muncul di sini."
                  : "Once you complete an activity, your little record will appear here."}
              </p>
            </div>
          ) : (
            <div className="max-w-3xl">
              {history
                .slice(0, 5)
                .map((log, index) => (
                  <HistoryItem
                    key={log.id}
                    log={log}
                    locale={locale}
                    last={
                      index ===
                      Math.min(history.length, 5) - 1
                    }
                  />
                ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* ========================================================= */
/* RECOMMENDED ROW                                           */
/* ========================================================= */

function RecommendedRow({
  activity,
  locale,
  index,
}: {
  activity: Activity;
  locale: Locale;
  index: number;
}) {
  const isId = locale === "id";
  const Icon = getCategoryIcon(
    activity.category,
  );

  return (
    <Link
      href={`/${locale}/activities/${activity.slug}`}
      className="group flex gap-4 border-b border-[#4a3f35]/10 py-5 transition hover:bg-[#fbc4ab]/10 md:px-3"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c1d5c0]/35">
        <Icon className="h-4 w-4 text-[#5c6b9c]" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5c6b9c]">
              0{index + 2}
            </span>

            <h3 className="mt-1 text-sm font-semibold text-[#4a3f35]">
              {activity.title}
            </h3>
          </div>

          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#4a3f35]/30 transition group-hover:translate-x-1 group-hover:text-[#5c6b9c]" />
        </div>

        <p className="mt-1 line-clamp-1 text-xs leading-5 text-[#4a3f35]/50">
          {activity.description}
        </p>

        <div className="mt-2 flex items-center gap-3 text-[11px] text-[#4a3f35]/40">
          <span>
            {formatCategory(
              activity.category,
              isId,
            )}
          </span>

          <span>·</span>

          <span>
            {activity.durationMinutes}{" "}
            {isId ? "menit" : "min"}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ========================================================= */
/* EXPLORE ROW                                               */
/* ========================================================= */

function ExploreActivityRow({
  activity,
  locale,
  index,
}: {
  activity: Activity;
  locale: Locale;
  index: number;
}) {
  const isId = locale === "id";
  const Icon = getCategoryIcon(
    activity.category,
  );

  return (
    <Link
      href={`/${locale}/activities/${activity.slug}`}
      className="group flex gap-4 border-b border-[#4a3f35]/10 py-6 transition hover:bg-[#fbc4ab]/10 md:px-3"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fbc4ab]/25 transition group-hover:bg-[#fbc4ab]/45">
        <Icon className="h-5 w-5 text-[#5c6b9c]" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4a3f35]/30">
              {String(index + 1).padStart(2, "0")}
            </span>

            <h3 className="mt-1 text-base font-semibold text-[#4a3f35]">
              {activity.title}
            </h3>
          </div>

          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#4a3f35]/25 transition group-hover:translate-x-1 group-hover:text-[#5c6b9c]" />
        </div>

        <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-6 text-[#4a3f35]/55">
          {activity.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#4a3f35]/45">
          <span>
            {formatCategory(
              activity.category,
              isId,
            )}
          </span>

          <span>
            {formatDifficulty(
              activity.difficulty,
              isId,
            )}
          </span>

          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" />

            {activity.durationMinutes}{" "}
            {isId ? "menit" : "min"}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ========================================================= */
/* HISTORY ITEM                                              */
/* ========================================================= */

function HistoryItem({
  log,
  locale,
  last,
}: {
  log: ActivityLog;
  locale: Locale;
  last: boolean;
}) {
  const isId = locale === "id";

  return (
    <div
      className={[
        "relative flex gap-4 pb-7",
        !last ? "border-l border-[#4a3f35]/10 ml-[7px]" : "ml-[7px]",
      ].join(" ")}
    >
      <div className="-ml-[8px] mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#fdfbf7]">
        <span className="h-2 w-2 rounded-full bg-[#c1d5c0]" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#4a3f35]">
              {log.activity.title}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#4a3f35]/45">
              <span>
                {formatCategory(
                  log.activity.category,
                  isId,
                )}
              </span>

              <span>·</span>

              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3 w-3" />

                {log.activity.durationMinutes}{" "}
                {isId ? "menit" : "min"}
              </span>
            </div>
          </div>

          {log.userRating !== null && (
            <span className="text-xs font-medium text-[#5c6b9c]">
              {log.userRating}/5
            </span>
          )}
        </div>

        {log.userFeedback && (
          <p className="mt-3 max-w-xl text-xs leading-5 text-[#4a3f35]/50">
            “{log.userFeedback}”
          </p>
        )}
      </div>
    </div>
  );
}