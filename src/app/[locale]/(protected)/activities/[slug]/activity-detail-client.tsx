"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Star,
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
};

type ActivityLog = {
  id: string;
  completed: boolean;
};

type Props = {
  locale: Locale;
  slug: string;
};

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

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");

  const remaining = (seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remaining}`;
}

export default function ActivityDetailClient({
  locale,
  slug,
}: Props) {
  const isId = locale === "id";

  const [activity, setActivity] = useState<Activity | null>(null);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [log, setLog] = useState<ActivityLog | null>(null);

  const [started, setStarted] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const totalSeconds = useMemo(() => {
    return (activity?.durationMinutes ?? 0) * 60;
  }, [activity]);

  /*
   * Load activity
   */
  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/activities", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load activities");
        }

        const data = await response.json();

        const found = Array.isArray(data.activities)
          ? data.activities.find(
              (item: Activity) => item.slug === slug,
            )
          : null;

        if (!found) {
          throw new Error("Activity not found");
        }

        if (!cancelled) {
          setActivity(found);
          setRemainingSeconds(found.durationMinutes * 60);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            isId
              ? "Aktivitas tidak ditemukan."
              : "Activity not found.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, [slug, isId]);

  /*
   * Timer
   */
  useEffect(() => {
    if (
      !started ||
      reviewing ||
      completed ||
      remainingSeconds <= 0
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    started,
    reviewing,
    completed,
    remainingSeconds,
  ]);

  /*
   * Start activity
   */
  async function handleStart() {
    if (!activity || starting) {
      return;
    }

    try {
      setStarting(true);
      setError("");

      const response = await fetch(
        `/api/activities/${activity.id}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({}),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isId
              ? "Gagal memulai aktivitas."
              : "Failed to start activity."),
        );
      }

      setLog(data.log);
      setStarted(true);
      setReviewing(false);
      setCompleted(false);
      setRemainingSeconds(totalSeconds);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isId
            ? "Gagal memulai aktivitas."
            : "Failed to start activity.",
      );
    } finally {
      setStarting(false);
    }
  }

  /*
   * Open review form.
   *
   * Important:
   * This DOES NOT mark the ActivityLog as completed yet.
   */
  function handleFinishSession() {
    if (!log) {
      return;
    }

    setStarted(false);
    setReviewing(true);
    setRemainingSeconds(0);
  }

  /*
   * Submit rating + feedback.
   *
   * This is where ActivityLog.completed becomes true.
   */
  async function handleSubmitReview() {
    if (!activity || !log || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `/api/activities/${activity.id}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            logId: log.id,
            userRating: rating || null,
            userFeedback: feedback.trim() || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isId
              ? "Gagal menyimpan aktivitas."
              : "Failed to save activity."),
        );
      }

      setLog(data.log);
      setReviewing(false);
      setCompleted(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isId
            ? "Gagal menyimpan aktivitas."
            : "Failed to save activity.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * Reset activity
   */
  function handleReset() {
    if (!activity) {
      return;
    }

    setStarted(false);
    setReviewing(false);
    setCompleted(false);

    setLog(null);

    setRemainingSeconds(
      activity.durationMinutes * 60,
    );

    setRating(0);
    setFeedback("");
    setError("");
  }

  if (loading) {
    return (
      <main className="min-h-full bg-[#f8f8fb] p-6 lg:p-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="min-h-full bg-[#f8f8fb] p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/${locale}/activities`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            {isId
              ? "Kembali ke Activities"
              : "Back to Activities"}
          </Link>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h1 className="text-xl font-bold text-slate-900">
              {error}
            </h1>
          </div>
        </div>
      </main>
    );
  }

  const progress =
    totalSeconds > 0
      ? ((totalSeconds - remainingSeconds) /
          totalSeconds) *
        100
      : 0;

  return (
    <main className="min-h-full bg-[#f8f8fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <Link
          href={`/${locale}/activities`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />

          {isId
            ? "Kembali ke Activities"
            : "Back to Activities"}
        </Link>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            INTRO
        ====================================================== */}
        {!started && !reviewing && !completed && (
          <section className="mt-6 overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-indigo-50 via-white to-white p-6 sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  {activity.category}
                </span>

                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />

                  {activity.durationMinutes}{" "}
                  {isId ? "menit" : "minutes"}
                </span>

                <span className="text-xs text-slate-400">
                  {formatDifficulty(
                    activity.difficulty,
                    isId,
                  )}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {activity.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                {activity.description}
              </p>
            </div>

            <div className="border-t border-slate-100 p-6 sm:p-8">
              <h2 className="text-base font-bold text-slate-900">
                {isId
                  ? "Cara melakukannya"
                  : "How to do it"}
              </h2>

              <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {activity.instructions}
              </div>

              <button
                type="button"
                onClick={handleStart}
                disabled={starting}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {starting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}

                {isId
                  ? "Mulai Aktivitas"
                  : "Start Activity"}
              </button>
            </div>
          </section>
        )}

        {/* =====================================================
            TIMER
        ====================================================== */}
        {started && !reviewing && !completed && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="text-center">
              <p className="text-sm font-semibold text-indigo-600">
                {activity.title}
              </p>

              <h1 className="mt-2 text-xl font-bold text-slate-900">
                {isId
                  ? "Luangkan waktu untuk dirimu."
                  : "Take a moment for yourself."}
              </h1>

              <div className="mx-auto mt-10 flex h-52 w-52 items-center justify-center rounded-full border-[10px] border-indigo-50">
                <div className="text-center">
                  <p className="text-4xl font-bold tabular-nums text-slate-900">
                    {formatTime(remainingSeconds)}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {isId ? "tersisa" : "remaining"}
                  </p>
                </div>
              </div>

              <div className="mx-auto mt-8 max-w-md">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        100,
                        progress,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-10 rounded-2xl bg-slate-50 p-5 text-left">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {activity.instructions}
                </p>
              </div>

              <button
                type="button"
                onClick={handleFinishSession}
                disabled={!log}
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />

                {isId
                  ? "Saya Sudah Selesai"
                  : "I'm Done"}
              </button>
            </div>
          </section>
        )}

        {/* =====================================================
            REVIEW
        ====================================================== */}
        {reviewing && !completed && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="mx-auto max-w-xl">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                  <CheckCircle2 className="h-8 w-8 text-indigo-600" />
                </div>

                <h1 className="mt-5 text-2xl font-bold text-slate-900">
                  {isId
                    ? "Aktivitas selesai."
                    : "Activity session complete."}
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {isId
                    ? "Sebelum selesai, bagaimana pengalamanmu?"
                    : "Before you finish, how was the experience?"}
                </p>
              </div>

              {/* Rating */}
              <div className="mt-8">
                <p className="text-sm font-semibold text-slate-900">
                  {isId
                    ? "Bagaimana perasaanmu setelah aktivitas ini?"
                    : "How do you feel after this activity?"}
                </p>

                <div className="mt-4 flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={[
                        "flex h-11 w-11 items-center justify-center rounded-xl border transition",
                        rating >= value
                          ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                          : "border-slate-200 bg-white text-slate-300 hover:border-indigo-100 hover:text-indigo-300",
                      ].join(" ")}
                      aria-label={`${value} out of 5`}
                    >
                      <Star
                        className="h-5 w-5"
                        fill={
                          rating >= value
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div className="mt-7">
                <label
                  htmlFor="activity-feedback"
                  className="text-sm font-semibold text-slate-900"
                >
                  {isId
                    ? "Ceritakan sedikit tentang pengalamanmu"
                    : "Tell us a little about your experience"}
                </label>

                <textarea
                  id="activity-feedback"
                  value={feedback}
                  onChange={(event) =>
                    setFeedback(event.target.value)
                  }
                  placeholder={
                    isId
                      ? "Opsional..."
                      : "Optional..."
                  }
                  rows={5}
                  maxLength={1000}
                  className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {feedback.length}/1000
                </p>
              </div>

              {/* Actions */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setReviewing(false);
                    setStarted(true);
                  }}
                  disabled={submitting}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {isId
                    ? "Kembali ke Timer"
                    : "Back to Timer"}
                </button>

                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {isId
                    ? "Submit & Selesai"
                    : "Submit & Finish"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            COMPLETED
        ====================================================== */}
        {completed && (
          <section className="mt-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-10">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>

              <h1 className="mt-5 text-2xl font-bold text-slate-900">
                {isId
                  ? "Selesai. Kamu sudah meluangkan waktu untuk dirimu."
                  : "Done. You took a moment for yourself."}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isId
                  ? "Aktivitas ini sudah tercatat dalam riwayatmu."
                  : "This activity has been added to your history."}
              </p>

              {rating > 0 && (
                <div className="mt-6 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className="h-5 w-5 text-indigo-600"
                      fill={
                        rating >= value
                          ? "currentColor"
                          : "none"
                      }
                    />
                  ))}
                </div>
              )}

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href={`/${locale}/activities`}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {isId
                    ? "Kembali ke Activities"
                    : "Back to Activities"}
                </Link>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <RotateCcw className="h-4 w-4" />

                  {isId
                    ? "Lakukan Lagi"
                    : "Do Again"}
                </button>

                <Link
                  href={`/${locale}/insights`}
                  className="inline-flex items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  {isId
                    ? "Lihat Insights"
                    : "View Insights"}
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}