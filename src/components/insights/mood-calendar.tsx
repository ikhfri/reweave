"use client";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Circle,
  Heart,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { Locale } from "@/i18n/config";

type CalendarEmotion = {
  id: string;
  name: string;
  slug: string;
  category: string;
  intensity: number;
  note: string | null;
};

type CalendarActivity = {
  id: string;
  title: string;
  slug: string;
  category: string;
  durationMinutes: number;
  completed: boolean;
  userRating: number | null;
  createdAt: string;
};

type CalendarDay = {
  date: string;
  hasCheckin: boolean;
  checkin: {
    id: string;
    overallIntensity: number;
  };
  emotions: CalendarEmotion[];
  contexts: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  diary: {
    id: string;
    content: string | null;
    entryType: string;
    createdAt: string;
  } | null;
  diaryCount: number;
  activities: CalendarActivity[];
  aiInsight: {
    id: string;
    summary: string;
    stressScore: number | null;
    sentiment: string | null;
    emotionalState: string | null;
    possibleTriggers: unknown;
    recommendations: unknown;
    riskLevel: string;
    createdAt: string;
  } | null;
};

type CalendarResponse = {
  success: boolean;
  year: number;
  month: number;
  days: CalendarDay[];
};

type Props = {
  locale: Locale;
};

const emotionEmoji: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  anxious: "😰",
  stressed: "😣",
  calm: "😌",
  tired: "😴",
  excited: "🤩",
  lonely: "🥺",
  grateful: "😊",
  frustrated: "😤",
  overwhelmed: "😵‍💫",
};

function getEmotionEmoji(slug: string) {
  const normalized = slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  return emotionEmoji[normalized] ?? "•";
}

function getMoodLevel(day: CalendarDay) {
  if (!day.hasCheckin) {
    return "empty";
  }

  const intensity = day.checkin.overallIntensity;

  if (intensity <= 1) {
    return "low";
  }

  if (intensity <= 2) {
    return "soft";
  }

  if (intensity <= 3) {
    return "mid";
  }

  if (intensity <= 4) {
    return "high";
  }

  return "very-high";
}

function getMoodDotClass(day: CalendarDay) {
  const level = getMoodLevel(day);

  switch (level) {
    case "low":
      return "bg-[#5c6b9c]";

    case "soft":
      return "bg-[#c1d5c0]";

    case "mid":
      return "bg-[#fbc4ab]";

    case "high":
      return "bg-[#e2725b]";

    case "very-high":
      return "bg-[#4a3f35]";

    default:
      return "border border-[#4a3f35]/15 bg-transparent";
  }
}

function getMonthName(
  year: number,
  month: number,
  locale: Locale,
) {
  return new Intl.DateTimeFormat(
    locale === "id" ? "id-ID" : "en-US",
    {
      month: "long",
      year: "numeric",
    },
  ).format(new Date(Date.UTC(year, month - 1, 1)));
}

function formatDate(
  dateKey: string,
  locale: Locale,
) {
  return new Intl.DateTimeFormat(
    locale === "id" ? "id-ID" : "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(new Date(`${dateKey}T00:00:00`));
}

export default function MoodCalendar({
  locale,
}: Props) {
  const isId = locale === "id";

  const now = new Date();

  const [year, setYear] = useState(
    now.getFullYear(),
  );

  const [month, setMonth] = useState(
    now.getMonth() + 1,
  );

  const [data, setData] =
    useState<CalendarResponse | null>(null);

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCalendar() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/insights/calendar?year=${year}&month=${month}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result =
          (await response.json()) as CalendarResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            isId
              ? "Gagal memuat kalender mood."
              : "Failed to load mood calendar.",
          );
        }

        if (cancelled) {
          return;
        }

        setData(result);

        setSelectedDate((current) => {
          if (
            current &&
            current.startsWith(
              `${year}-${String(month).padStart(2, "0")}`,
            )
          ) {
            return current;
          }

          return result.days[0]?.date ?? null;
        });
      } catch (err) {
        console.error(
          "[MoodCalendar]",
          err,
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : isId
                ? "Gagal memuat kalender mood."
                : "Failed to load mood calendar.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCalendar();

    return () => {
      cancelled = true;
    };
  }, [year, month, isId]);

  const dayMap = useMemo(() => {
    const map = new Map<
      string,
      CalendarDay
    >();

    for (const day of data?.days ?? []) {
      map.set(day.date, day);
    }

    return map;
  }, [data]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(
      Date.UTC(year, month - 1, 1),
    );

    const daysInMonth = new Date(
      Date.UTC(year, month, 0),
    ).getUTCDate();

    // Monday = 0 ... Sunday = 6
    const mondayIndex =
      (firstDay.getUTCDay() + 6) % 7;

    const cells: Array<
      | {
          type: "empty";
          key: string;
        }
      | {
          type: "day";
          key: string;
          day: number;
        }
    > = [];

    for (
      let index = 0;
      index < mondayIndex;
      index++
    ) {
      cells.push({
        type: "empty",
        key: `empty-${index}`,
      });
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      cells.push({
        type: "day",
        day,
        key: `${year}-${month}-${day}`,
      });
    }

    return cells;
  }, [month, year]);

  const selectedDay = selectedDate
    ? dayMap.get(selectedDate) ?? null
    : null;

  function changeMonth(
    direction: -1 | 1,
  ) {
    const next = new Date(
      Date.UTC(
        year,
        month - 1 + direction,
        1,
      ),
    );

    setYear(next.getUTCFullYear());
    setMonth(next.getUTCMonth() + 1);
    setSelectedDate(null);
  }

  const todayKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(
      2,
      "0",
    ),
    String(now.getDate()).padStart(
      2,
      "0",
    ),
  ].join("-");

  return (
    <section className="mt-6 rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5 md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row">
        {/* CALENDAR */}
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#5c6b9c]" />

                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c6b9c]">
                  Mood Calendar
                </p>
              </div>

              <h2 className="mt-1 text-xl font-semibold text-[#4a3f35]">
                {getMonthName(
                  year,
                  month,
                  locale,
                )}
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  changeMonth(-1)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#4a3f35]/10 text-[#4a3f35]/60 transition hover:border-[#5c6b9c]/30 hover:text-[#5c6b9c]"
                aria-label={
                  isId
                    ? "Bulan sebelumnya"
                    : "Previous month"
                }
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  changeMonth(1)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#4a3f35]/10 text-[#4a3f35]/60 transition hover:border-[#5c6b9c]/30 hover:text-[#5c6b9c]"
                aria-label={
                  isId
                    ? "Bulan berikutnya"
                    : "Next month"
                }
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-[#e2725b]/20 bg-[#fbc4ab]/20 p-4 text-sm text-[#4a3f35]/75">
              {error}
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="mb-2 grid grid-cols-7">
                {(isId
                  ? [
                      "Sen",
                      "Sel",
                      "Rab",
                      "Kam",
                      "Jum",
                      "Sab",
                      "Min",
                    ]
                  : [
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                      "Sun",
                    ]
                ).map((label) => (
                  <div
                    key={label}
                    className="py-2 text-center text-[10px] font-medium uppercase tracking-wide text-[#4a3f35]/35"
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {calendarCells.map(
                  (cell) => {
                    if (
                      cell.type ===
                      "empty"
                    ) {
                      return (
                        <div
                          key={cell.key}
                          className="aspect-square"
                        />
                      );
                    }

                    const dateKey = [
                      year,
                      String(month).padStart(
                        2,
                        "0",
                      ),
                      String(
                        cell.day,
                      ).padStart(
                        2,
                        "0",
                      ),
                    ].join("-");

                    const day =
                      dayMap.get(
                        dateKey,
                      );

                    const selected =
                      selectedDate ===
                      dateKey;

                    const isToday =
                      todayKey ===
                      dateKey;

                    return (
                      <button
                        key={cell.key}
                        type="button"
                        onClick={() =>
                          setSelectedDate(
                            dateKey,
                          )
                        }
                        className={[
                          "group relative flex aspect-square min-h-14 flex-col items-center justify-center rounded-xl border text-center transition",
                          selected
                            ? "border-[#5c6b9c]/50 bg-[#5c6b9c]/8"
                            : "border-transparent hover:border-[#4a3f35]/10 hover:bg-[#4a3f35]/3",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "text-xs font-medium",
                            isToday
                              ? "text-[#e2725b]"
                              : "text-[#4a3f35]/70",
                          ].join(" ")}
                        >
                          {
                            cell.day
                          }
                        </span>

                        <span
                          className={[
                            "mt-2 h-2.5 w-2.5 rounded-full transition",
                            day
                              ? getMoodDotClass(
                                  day,
                                )
                              : "border border-[#4a3f35]/10 bg-transparent",
                          ].join(" ")}
                        />

                        {day &&
                          day.emotions
                            .length >
                            0 && (
                            <span className="mt-1 hidden text-[9px] text-[#4a3f35]/35 sm:block">
                              {
                                day
                                  .emotions[0]
                                  .intensity
                              }
                              /5
                            </span>
                          )}

                        {isToday && (
                          <span className="absolute inset-x-3 bottom-1 h-px bg-[#e2725b]/50" />
                        )}
                      </button>
                    );
                  },
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[#4a3f35]/8 pt-4 text-[11px] text-[#4a3f35]/50">
                <span className="font-medium text-[#4a3f35]/65">
                  {isId
                    ? "Intensitas"
                    : "Intensity"}
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#5c6b9c]" />
                  1
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#c1d5c0]" />
                  2
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#fbc4ab]" />
                  3
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e2725b]" />
                  4
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4a3f35]" />
                  5
                </span>
              </div>
            </div>
          )}
        </div>

        {/* DAY DETAIL */}
        <aside className="w-full border-t border-[#4a3f35]/8 pt-5 xl:w-[390px] xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center text-sm text-[#4a3f35]/50">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#5c6b9c]/20 border-t-[#5c6b9c]" />

                {isId
                  ? "Memuat..."
                  : "Loading..."}
              </div>
            </div>
          ) : selectedDay ? (
            <div>
              <div className="mb-5">
                <p className="text-xs font-medium uppercase tracking-wide text-[#5c6b9c]">
                  Daily reflection
                </p>

                <h3 className="mt-1 text-lg font-semibold text-[#4a3f35]">
                  {formatDate(
                    selectedDay.date,
                    locale,
                  )}
                </h3>
              </div>

              <div className="space-y-5">
                {/* EMOTIONS */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-[#e2725b]" />

                    <p className="text-xs font-semibold uppercase tracking-wide text-[#4a3f35]/50">
                      {isId
                        ? "Emosi"
                        : "Emotions"}
                    </p>
                  </div>

                  {selectedDay
                    .emotions.length >
                  0 ? (
                    <div className="space-y-2">
                      {selectedDay.emotions.map(
                        (emotion) => (
                          <div
                            key={
                              emotion.id
                            }
                            className="rounded-xl bg-[#fbc4ab]/15 px-3 py-2.5"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-medium text-[#4a3f35]">
                                {getEmotionEmoji(
                                  emotion.slug,
                                )}{" "}
                                {
                                  emotion.name
                                }
                              </span>

                              <span className="text-xs font-medium text-[#5c6b9c]">
                                {
                                  emotion.intensity
                                }
                                /5
                              </span>
                            </div>

                            {emotion.note && (
                              <p className="mt-1 text-xs leading-5 text-[#4a3f35]/55">
                                {
                                  emotion.note
                                }
                              </p>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-[#4a3f35]/45">
                      {isId
                        ? "Tidak ada emosi yang dipilih."
                        : "No emotions selected."}
                    </p>
                  )}
                </div>

                {/* CONTEXT */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#4a3f35]/50">
                    Context
                  </p>

                  {selectedDay
                    .contexts.length >
                  0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedDay.contexts.map(
                        (context) => (
                          <span
                            key={
                              context.id
                            }
                            className="rounded-full bg-[#c1d5c0]/25 px-3 py-1.5 text-xs text-[#4a3f35]/70"
                          >
                            {
                              context.name
                            }
                          </span>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-[#4a3f35]/45">
                      {isId
                        ? "Belum ada context."
                        : "No context recorded."}
                    </p>
                  )}
                </div>

                {/* DIARY */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#5c6b9c]" />

                    <p className="text-xs font-semibold uppercase tracking-wide text-[#4a3f35]/50">
                      Diary
                    </p>
                  </div>

                  {selectedDay.diary
                    ?.content ? (
                    <div className="rounded-xl border border-[#4a3f35]/8 bg-[#fdfbf7] p-3">
                      <p className="line-clamp-5 text-sm leading-6 text-[#4a3f35]/70">
                        {
                          selectedDay
                            .diary
                            .content
                        }
                      </p>

                      {selectedDay
                        .diaryCount >
                        1 && (
                        <p className="mt-2 text-[11px] text-[#4a3f35]/40">
                          +{" "}
                          {selectedDay
                            .diaryCount -
                            1}{" "}
                          {isId
                            ? "entry lainnya"
                            : "more entries"}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-[#4a3f35]/45">
                      {isId
                        ? "Belum ada diary."
                        : "No diary entry."}
                    </p>
                  )}
                </div>

                {/* ACTIVITY */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#5c6b9c]" />

                    <p className="text-xs font-semibold uppercase tracking-wide text-[#4a3f35]/50">
                      {isId
                        ? "Activity"
                        : "Activity"}
                    </p>
                  </div>

                  {selectedDay
                    .activities.length >
                  0 ? (
                    <div className="space-y-2">
                      {selectedDay.activities.map(
                        (
                          activity,
                          index,
                        ) => (
                          <div
                            key={`${activity.id}-${index}`}
                            className="flex items-center justify-between gap-3 rounded-xl bg-[#c1d5c0]/15 px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#4a3f35]">
                                {
                                  activity.title
                                }
                              </p>

                              <p className="mt-0.5 text-[11px] text-[#4a3f35]/45">
                                {
                                  activity.durationMinutes
                                }{" "}
                                min
                              </p>
                            </div>

                            {activity.completed ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5c6b9c]" />
                            ) : (
                              <Circle className="h-4 w-4 shrink-0 text-[#4a3f35]/25" />
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-[#4a3f35]/45">
                      {isId
                        ? "Belum ada aktivitas."
                        : "No activity recorded."}
                    </p>
                  )}
                </div>

                {/* AI INSIGHT */}
                <div className="rounded-xl border border-[#5c6b9c]/15 bg-[#5c6b9c]/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-[#5c6b9c]" />

                    <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6b9c]">
                      AI Insight
                    </p>
                  </div>

                  {selectedDay.aiInsight ? (
                    <>
                      <p className="text-sm leading-6 text-[#4a3f35]/75">
                        {
                          selectedDay
                            .aiInsight
                            .summary
                        }
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedDay
                          .aiInsight
                          .sentiment && (
                          <span className="rounded-full bg-[#fdfbf7] px-2.5 py-1 text-[11px] text-[#4a3f35]/60">
                            {
                              selectedDay
                                .aiInsight
                                .sentiment
                            }
                          </span>
                        )}

                        {selectedDay
                          .aiInsight
                          .stressScore !==
                          null && (
                          <span className="rounded-full bg-[#fdfbf7] px-2.5 py-1 text-[11px] text-[#4a3f35]/60">
                            Stress{" "}
                            {
                              selectedDay
                                .aiInsight
                                .stressScore
                            }
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm leading-6 text-[#4a3f35]/55">
                      {isId
                        ? "Belum ada AI insight untuk tanggal ini."
                        : "There is no AI insight for this date yet."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[360px] items-center justify-center text-center">
              <div>
                <CalendarDays className="mx-auto h-8 w-8 text-[#5c6b9c]/40" />

                <p className="mt-3 text-sm font-medium text-[#4a3f35]/65">
                  {isId
                    ? "Pilih tanggal untuk melihat detail."
                    : "Select a date to view its details."}
                </p>

                <p className="mt-1 text-xs text-[#4a3f35]/40">
                  {isId
                    ? "Setiap hari akan menampilkan mood, diary, activity, dan AI insight."
                    : "Each day shows mood, diary, activity, and AI insight."}
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}