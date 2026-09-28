"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Heart,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Locale } from "@/i18n/config";

type CalendarEmotion = {
  id: string;
  name: string;
  slug: string;
  category: string;
  intensity: number;
  note: string | null;
};

type CalendarDay = {
  date: string;
  hasCheckin: boolean;

  checkin: {
    id: string;
    overallIntensity: number;
  } | null;

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
};

type CalendarResponse = {
  success: boolean;
  year: number;
  month: number;
  days: CalendarDay[];
};

type Props = {
  locale: Locale;
  userName: string;
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

  return (
    emotionEmoji[normalized] ?? "•"
  );
}

function getHighestEmotion(
  emotions: CalendarEmotion[],
) {
  if (emotions.length === 0) {
    return null;
  }

  return [...emotions].sort(
    (a, b) => b.intensity - a.intensity,
  )[0];
}

    
function getMonthName(
  year: number,
  month: number,
  locale: Locale,
) {
  return new Intl.DateTimeFormat(
    locale === "id"
      ? "id-ID"
      : "en-US",
    {
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(
      Date.UTC(
        year,
        month - 1,
        1,
      ),
    ),
  );
}

function formatDate(
  dateKey: string,
  locale: Locale,
) {
  return new Intl.DateTimeFormat(
    locale === "id"
      ? "id-ID"
      : "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(
      `${dateKey}T00:00:00`,
    ),
  );
}

export default function MoodCalendarClient({
  locale,
  userName,
}: Props) {
  const isId = locale === "id";

  const now = new Date();

  const [year, setYear] =
    useState(now.getFullYear());

  const [month, setMonth] =
    useState(now.getMonth() + 1);

  const [data, setData] =
    useState<CalendarResponse | null>(
      null,
    );

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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

        if (
          !response.ok ||
          !result.success
        ) {
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
              `${year}-${String(
                month,
              ).padStart(2, "0")}`,
            )
          ) {
            return current;
          }

          return (
            result.days[0]?.date ??
            null
          );
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

    for (
      const day of data?.days ?? []
    ) {
      map.set(day.date, day);
    }

    return map;
  }, [data]);

  const calendarCells = useMemo(() => {
    const firstDay =
      new Date(
        Date.UTC(
          year,
          month - 1,
          1,
        ),
      );

    const daysInMonth =
      new Date(
        Date.UTC(
          year,
          month,
          0,
        ),
      ).getUTCDate();

    // Monday = 0 ... Sunday = 6
    const mondayIndex =
      (firstDay.getUTCDay() + 6) %
      7;

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

  const selectedDay =
    selectedDate
      ? dayMap.get(
          selectedDate,
        ) ?? null
      : null;

  const selectedEmotion =
    selectedDay
      ? getHighestEmotion(
          selectedDay.emotions,
        )
      : null;

  const todayKey = [
    now.getFullYear(),
    String(
      now.getMonth() + 1,
    ).padStart(2, "0"),
    String(
      now.getDate(),
    ).padStart(2, "0"),
  ].join("-");

  function changeMonth(
    direction: -1 | 1,
  ) {
    const next =
      new Date(
        Date.UTC(
          year,
          month - 1 + direction,
          1,
        ),
      );

    setYear(
      next.getUTCFullYear(),
    );

    setMonth(
      next.getUTCMonth() + 1,
    );

    setSelectedDate(null);
  }

  return (
    <main className="min-h-screen bg-[#fdfbf7] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <header className="mb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#5c6b9c]">
                {isId
                  ? "Perjalanan mood"
                  : "Mood journey"}
              </p>

              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#4a3f35] md:text-4xl">
                {isId
                  ? `Kalender mood, ${userName}`
                  : `Your mood calendar, ${userName}`}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#4a3f35]/60 md:text-[15px]">
                {isId
                  ? "Lihat emosi yang paling kuat tercatat di setiap harimu."
                  : "See the strongest emotion recorded on each day."}
              </p>
            </div>
          </div>
        </header>

        {/* MAIN CARD */}

        <section className="rounded-[2rem] border border-[#4a3f35]/10 bg-[#fdfbf7] p-5 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

            {/* CALENDAR */}

            <div className="min-w-0">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#5c6b9c]" />

                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c6b9c]">
                      Mood Calendar
                    </span>
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
                <div className="rounded-xl border border-[#e2725b]/20 bg-[#fbc4ab]/20 p-5 text-sm text-[#4a3f35]/75">
                  {error}
                </div>
              ) : (
                <>
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
                    ).map(
                      (label) => (
                        <div
                          key={label}
                          className="py-2 text-center text-[10px] font-medium uppercase tracking-wide text-[#4a3f35]/35"
                        >
                          {label}
                        </div>
                      ),
                    )}
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
                              key={
                                cell.key
                              }
                              className="aspect-square"
                            />
                          );
                        }

                        const dateKey = [
                          year,
                          String(
                            month,
                          ).padStart(
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

                        const emotion =
                          day
                            ? getHighestEmotion(
                                day.emotions,
                              )
                            : null;

                        const selected =
                          selectedDate ===
                          dateKey;

                        const isToday =
                          todayKey ===
                          dateKey;

                        return (
                          <button
                            key={
                              cell.key
                            }
                            type="button"
                            onClick={() =>
                              setSelectedDate(
                                dateKey,
                              )
                            }
                            className={[
                              "group relative flex aspect-square min-h-16 flex-col items-center justify-center rounded-xl border text-center transition sm:min-h-20",
                              selected
                                ? "border-[#5c6b9c]/50 bg-[#5c6b9c]/8"
                                : "border-transparent hover:border-[#4a3f35]/10 hover:bg-[#4a3f35]/[0.03]",
                            ].join(
                              " ",
                            )}
                          >
                            <span
                              className={[
                                "text-xs font-medium",
                                isToday
                                  ? "text-[#e2725b]"
                                  : "text-[#4a3f35]/70",
                              ].join(
                                " ",
                              )}
                            >
                              {
                                cell.day
                              }
                            </span>

                            {emotion ? (
                              <>
                                <span className="mt-1.5 text-base leading-none sm:text-lg">
                                  {getEmotionEmoji(
                                    emotion.slug,
                                  )}
                                </span>

                                <span className="mt-1 text-[9px] font-medium text-[#4a3f35]/40">
                                  {
                                    emotion.intensity
                                  }
                                  /5
                                </span>
                              </>
                            ) : (
                              <span className="mt-2 h-2.5 w-2.5 rounded-full border border-[#4a3f35]/10" />
                            )}

                            {isToday && (
                              <span className="absolute inset-x-3 bottom-1 h-px bg-[#e2725b]/50" />
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>

                  {/* LEGEND */}

                  <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[#4a3f35]/8 pt-4 text-[11px] text-[#4a3f35]/50">
                    <span className="font-medium text-[#4a3f35]/65">
                      {isId
                        ? "Intensitas"
                        : "Intensity"}
                    </span>

                    {[1, 2, 3, 4, 5].map(
                      (level) => (
                        <span
                          key={level}
                          className="flex items-center gap-1.5"
                        >
                          <span
                            className={[
                              "h-2.5 w-2.5 rounded-full",
                              level === 1
                                ? "bg-[#5c6b9c]"
                                : level === 2
                                  ? "bg-[#c1d5c0]"
                                  : level === 3
                                    ? "bg-[#fbc4ab]"
                                    : level === 4
                                      ? "bg-[#e2725b]"
                                      : "bg-[#4a3f35]",
                            ].join(
                              " ",
                            )}
                          />

                          {level}
                        </span>
                      ),
                    )}
                  </div>
                </>
              )}
            </div>

            {/* DETAIL */}

            <aside className="border-t border-[#4a3f35]/8 pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {loading ? (
                <div className="flex min-h-[320px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#5c6b9c]/20 border-t-[#5c6b9c]" />

                    <p className="text-sm text-[#4a3f35]/50">
                      {isId
                        ? "Memuat kalender..."
                        : "Loading calendar..."}
                    </p>
                  </div>
                </div>
              ) : selectedDay ? (
                <div>
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c6b9c]">
                      {isId
                        ? "Detail hari"
                        : "Day detail"}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold leading-tight text-[#4a3f35]">
                      {formatDate(
                        selectedDay.date,
                        locale,
                      )}
                    </h3>
                  </div>

                  {selectedEmotion ? (
                    <div>
                      <div className="rounded-[1.5rem] bg-[#fbc4ab]/25 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-4xl">
                              {getEmotionEmoji(
                                selectedEmotion.slug,
                              )}
                            </span>

                            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#5c6b9c]">
                              {isId
                                ? "Emosi utama hari ini"
                                : "Main emotion today"}
                            </p>

                            <h4 className="mt-1 text-2xl font-semibold text-[#4a3f35]">
                              {
                                selectedEmotion.name
                              }
                            </h4>
                          </div>

                          <div className="text-right">
                            <span className="text-2xl font-semibold text-[#4a3f35]">
                              {
                                selectedEmotion.intensity
                              }
                            </span>

                            <span className="text-sm text-[#4a3f35]/40">
                              /5
                            </span>
                          </div>
                        </div>

                        <div className="mt-6">
                          <div className="mb-2 flex justify-between text-[11px] text-[#4a3f35]/45">
                            <span>
                              {isId
                                ? "Intensitas"
                                : "Intensity"}
                            </span>

                            <span>
                              {
                                selectedEmotion.intensity
                              }
                              /5
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-[#fdfbf7]">
                            <div
                              className="h-full rounded-full bg-[#e2725b]"
                              style={{
                                width: `${
                                  selectedEmotion.intensity *
                                  20
                                }%`,
                              }}
                            />
                          </div>
                        </div>

                        {selectedEmotion.note && (
                          <div className="mt-6 border-t border-[#4a3f35]/10 pt-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4a3f35]/40">
                              {isId
                                ? "Catatan"
                                : "Note"}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-[#4a3f35]/70">
                              {
                                selectedEmotion.note
                              }
                            </p>
                          </div>
                        )}
                      </div>

                      {selectedDay.contexts.length >
                        0 && (
                        <div className="mt-6">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4a3f35]/40">
                            Context
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedDay.contexts.map(
                              (
                                context,
                              ) => (
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
                        </div>
                      )}

                      {selectedDay.diary?.content && (
                        <div className="mt-6 border-t border-[#4a3f35]/8 pt-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4a3f35]/40">
                            Diary
                          </p>

                          <p className="mt-2 line-clamp-4 text-sm leading-6 text-[#4a3f35]/60">
                            {
                              selectedDay
                                .diary
                                .content
                            }
                          </p>
                        </div>
                      )}

                      {selectedDay.checkin && (
                        <Link
                          href={`/${locale}/check-in/result/${selectedDay.checkin.id}`}
                          className="mt-6 flex items-center justify-between rounded-xl border border-[#4a3f35]/10 px-4 py-3 text-sm font-medium text-[#4a3f35]/70 transition hover:border-[#5c6b9c]/30 hover:text-[#5c6b9c]"
                        >
                          <span>
                            {isId
                              ? "Lihat check-in"
                              : "View check-in"}
                          </span>

                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="flex min-h-[320px] items-center justify-center text-center">
                      <div>
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#c1d5c0]/25">
                          <Heart className="h-6 w-6 text-[#5c6b9c]" />
                        </div>

                        <h4 className="mt-4 text-base font-semibold text-[#4a3f35]">
                          {isId
                            ? "Belum ada mood"
                            : "No mood recorded"}
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-[#4a3f35]/50">
                          {isId
                            ? "Belum ada check-in atau emosi yang tercatat pada hari ini."
                            : "There is no check-in or emotion recorded for this day."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex min-h-[320px] items-center justify-center text-center">
                  <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fbc4ab]/25">
                      <CalendarDays className="h-6 w-6 text-[#5c6b9c]" />
                    </div>

                    <h4 className="mt-4 text-base font-semibold text-[#4a3f35]">
                      {isId
                        ? "Pilih tanggal"
                        : "Select a date"}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-[#4a3f35]/50">
                      {isId
                        ? "Pilih tanggal untuk melihat emosi utama hari tersebut."
                        : "Select a date to see the main emotion for that day."}
                    </p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}