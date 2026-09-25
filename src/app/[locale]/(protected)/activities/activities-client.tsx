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
    return isId ? "Grounding" : "Grounding";
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
    const values = activities.map((activity) => activity.category);

    return ["all", ...Array.from(new Set(values))];
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (activeCategory === "all") {
      return activities;
    }

    return activities.filter(
      (activity) => activity.category === activeCategory,
    );
  }, [activities, activeCategory]);

  useEffect(() => {
    let cancelled = false;

    async function loadActivities() {
      try {
        setLoading(true);
        setError("");

        const [activitiesResponse, recommendedResponse, historyResponse] =
          await Promise.all([
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
          throw new Error("Failed to load activities");
        }

        const activitiesData = await activitiesResponse.json();
        const recommendedData = recommendedResponse.ok
          ? await recommendedResponse.json()
          : { activities: [] };

        const historyData = historyResponse.ok
          ? await historyResponse.json()
          : { logs: [] };

        if (cancelled) return;

        setActivities(
          Array.isArray(activitiesData.activities)
            ? activitiesData.activities
            : [],
        );

        setRecommended(
          Array.isArray(recommendedData.activities)
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
      <main className="min-h-full bg-[#f8f8fb] p-6 lg:p-8">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            {isId ? "Memuat aktivitas..." : "Loading activities..."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-[#f8f8fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-indigo-600">
              {isId ? "Wellbeing Activities" : "Wellbeing Activities"}
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {isId
                ? `Aktivitas untuk kamu, ${userName}`
                : `Activities for you, ${userName}`}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {isId
                ? "Luangkan beberapa menit untuk melakukan sesuatu yang bisa membantu kamu merasa lebih tenang dan terhubung dengan diri sendiri."
                : "Take a few minutes to do something that may help you feel calmer and more connected with yourself."}
            </p>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Recommended */}
        {recommended.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />

                  <p className="text-sm font-semibold text-indigo-600">
                    {isId ? "Recommended for You" : "Recommended for You"}
                  </p>
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  {isId
                    ? "Aktivitas berdasarkan check-in kamu"
                    : "Activities based on your check-in"}
                </h2>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {recommended.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  locale={locale}
                  recommended
                />
              ))}
            </div>
          </section>
        )}

        {/* Explore */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              {isId ? "Explore Activities" : "Explore Activities"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isId
                ? "Pilih aktivitas yang sesuai dengan kebutuhanmu."
                : "Choose an activity that fits what you need right now."}
            </p>
          </div>

          {/* Category filters */}
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => {
              const selected = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={[
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
                    selected
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600",
                  ].join(" ")}
                >
                  {category === "all"
                    ? isId
                      ? "Semua"
                      : "All"
                    : formatCategory(category, isId)}
                </button>
              );
            })}
          </div>

          {filteredActivities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm text-slate-500">
                {isId
                  ? "Belum ada aktivitas pada kategori ini."
                  : "No activities found in this category."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </section>

        {/* History */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              {isId ? "Recently Completed" : "Recently Completed"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isId
                ? "Aktivitas yang baru saja kamu lakukan."
                : "Activities you recently completed."}
            </p>
          </div>

          {history.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    {isId
                      ? "Belum ada aktivitas"
                      : "No activity history yet"}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {isId
                      ? "Setelah kamu menyelesaikan aktivitas, riwayatnya akan muncul di sini."
                      : "Once you complete an activity, your history will appear here."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {history.slice(0, 5).map((log, index) => (
                <div
                  key={log.id}
                  className={[
                    "flex items-center justify-between gap-4 p-4",
                    index !== Math.min(history.length, 5) - 1
                      ? "border-b border-slate-100"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {log.activity.title}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        {log.activity.durationMinutes}{" "}
                        {isId ? "menit" : "min"}
                      </div>
                    </div>
                  </div>

                  {log.userRating && (
                    <div className="shrink-0 text-sm font-medium text-slate-600">
                      {log.userRating}/5
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ActivityCard({
  activity,
  locale,
  recommended = false,
}: {
  activity: Activity;
  locale: Locale;
  recommended?: boolean;
}) {
  const isId = locale === "id";
  const Icon = getCategoryIcon(activity.category);

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-2xl border bg-white p-5 transition",
        recommended
          ? "border-indigo-100 shadow-sm hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm",
      ].join(" ")}
    >
      {recommended && (
        <div className="absolute right-4 top-4 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
          {isId ? "Untuk kamu" : "For you"}
        </div>
      )}

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
        <Icon className="h-5 w-5 text-indigo-600" />
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
            {formatCategory(activity.category, isId)}
          </span>

          <span className="text-xs text-slate-400">
            {formatDifficulty(activity.difficulty, isId)}
          </span>
        </div>

        <h3 className="mt-3 text-base font-bold text-slate-900">
          {activity.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {activity.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Clock3 className="h-3.5 w-3.5" />
            {activity.durationMinutes} {isId ? "menit" : "min"}
          </div>

          <Link
            href={`/${locale}/activities/${activity.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            {isId ? "Mulai" : "Start"}

            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}