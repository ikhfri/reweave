"use client";

import Image from "next/image";
import Link from "next/link";
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

type Context = {
  id: string;
  name: string;
  slug: string;
};

type CalendarDay = {
  date: string;
  hasCheckin: boolean;

  checkin: {
    id: string;
    overallIntensity: number;
  } | null;

  emotions: CalendarEmotion[];

  contexts: Context[];

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

const emotionArtwork: Record<string, string> = {
  happy: "/emotions-emoji/happy.png",
  loved: "/emotions-emoji/loved.png",
  excited: "/emotions-emoji/excited.png",
  hopeful: "/emotions-emoji/hopeful.png",
  calm: "/emotions-emoji/calm.png",
  tired: "/emotions-emoji/tired.png",
  anxious: "/emotions-emoji/anxious.png",
  stressed: "/emotions-emoji/stressed.png",
  angry: "/emotions-emoji/angry.png",
  lonely: "/emotions-emoji/lonely.png",
  sad: "/emotions-emoji/sad.png",
  overwhelmed: "/emotions-emoji/overwhelmed.png",
};

function getEmotionArtwork(slug: string) {
  const normalized = slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  return emotionArtwork[normalized] ?? "/emotions-emoji/calm.png";
}

const emotionTranslations: Record<string, { en: string; id: string }> = {
  happy: { en: "Happy", id: "Senang" },
  loved: { en: "Loved", id: "Dicintai" },
  excited: { en: "Excited", id: "Bersemangat" },
  hopeful: { en: "Hopeful", id: "Penuh Harapan" },
  calm: { en: "Calm", id: "Tenang" },
  tired: { en: "Tired", id: "Lelah" },
  anxious: { en: "Anxious", id: "Cemas" },
  stressed: { en: "Stressed", id: "Stres" },
  angry: { en: "Angry", id: "Marah" },
  lonely: { en: "Lonely", id: "Kesepian" },
  sad: { en: "Sad", id: "Sedih" },
  overwhelmed: { en: "Overwhelmed", id: "Kewalahan" },
};

function getEmotionLabel(emotion: CalendarEmotion, isId: boolean) {
  const translation = emotionTranslations[emotion.slug.toLowerCase()];
  return translation ? (isId ? translation.id : translation.en) : emotion.name;
}

function EmotionArtwork({
  slug,
  name,
  size = 44,
  className = "",
}: {
  slug: string;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={getEmotionArtwork(slug)}
      alt={name}
      width={size}
      height={size}
      className={`object-contain mix-blend-multiply ${className}`}
    />
  );
}

const contextTranslations: Record<string, { en: string; id: string }> = {
  family: { en: "Family", id: "Keluarga" },
  financial: { en: "Financial", id: "Keuangan" },
  "life changes": { en: "Life Changes", id: "Perubahan Hidup" },
  "life-changes": { en: "Life Changes", id: "Perubahan Hidup" },
  other: { en: "Other", id: "Lainnya" },
  "physical health": { en: "Physical Health", id: "Kesehatan Fisik" },
  "physical-health": { en: "Physical Health", id: "Kesehatan Fisik" },
  relationship: { en: "Relationship", id: "Hubungan" },
  "school / work": { en: "School / Work", id: "Sekolah / Pekerjaan" },
  "school-work": { en: "School / Work", id: "Sekolah / Pekerjaan" },
  sleep: { en: "Sleep", id: "Tidur" },
  social: { en: "Social", id: "Sosial" },
};

function getContextLabel(context: Context, isId: boolean) {
  const translation = contextTranslations[context.slug.toLowerCase()];
  return translation ? (isId ? translation.id : translation.en) : context.name;
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
        strokeWidth="1.7"
      />
      <path
        d="M7.5 3.5V7M16.5 3.5V7M3.5 9.5H20.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M7.5 13H7.51M12 13H12.01M16.5 13H16.51M7.5 16.5H7.51M12 16.5H12.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon({
  direction,
  size = 16,
  className = "",
}: {
  direction: "left" | "right";
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
      {direction === "left" ? (
        <>
          <path
            d="M19 12H5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M11 6L5 12L11 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M5 12H19"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M13 6L19 12L13 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

function ChevronRightIcon({
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
        d="M9 5L16 12L9 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon({
  size = 24,
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
        d="M20.8 8.8C20.8 13.5 12 19 12 19S3.2 13.5 3.2 8.8C3.2 6.5 4.9 4.7 7.2 4.7C8.7 4.7 10.1 5.5 12 7.1C13.9 5.5 15.3 4.7 16.8 4.7C19.1 4.7 20.8 6.5 20.8 8.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getHighestEmotion(emotions: CalendarEmotion[]) {
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
    locale === "id" ? "id-ID" : "en-US",
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
    locale === "id" ? "id-ID" : "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(`${dateKey}T00:00:00`),
  );
}

export default function MoodCalendarClient({
  locale,
  userName,
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
          const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;

          // Jika user sudah memilih tanggal dan masih di bulan yang sama, pertahankan
          if (current && current.startsWith(monthPrefix)) {
            return current;
          }

          // Dapatkan tanggal real hari ini dari sistem
          const realNow = new Date();
          const realTodayKey = [
            realNow.getFullYear(),
            String(realNow.getMonth() + 1).padStart(2, "0"),
            String(realNow.getDate()).padStart(2, "0"),
          ].join("-");

          // Jika kalender yang dibuka adalah bulan ini, default ke hari ini
          if (realTodayKey.startsWith(monthPrefix)) {
            return realTodayKey;
          }

          // Jika user membuka bulan lalu/depan, fallback pilih tanggal 1
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
    const map = new Map<string, CalendarDay>();

    for (const day of data?.days ?? []) {
      map.set(day.date, day);
    }

    return map;
  }, [data]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(
      Date.UTC(
        year,
        month - 1,
        1,
      ),
    );

    const daysInMonth = new Date(
      Date.UTC(
        year,
        month,
        0,
      ),
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

  const selectedEmotion = selectedDay
    ? getHighestEmotion(selectedDay.emotions)
    : null;

  const todayKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

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

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-6 text-[#4A3F35] md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C] md:text-xs">
                {isId ? "Perjalanan mood" : "Mood journey"}
              </p>

              {/* Ubah text-3xl menjadi text-2xl untuk mobile */}
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#4A3F35] md:text-4xl">
                {isId ? `Kalender mood, ${userName}` : `Your mood calendar, ${userName}`}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#4A3F35]/60 md:mt-3 md:text-[15px] md:leading-7">
                {isId
                  ? "Lihat emosi yang paling kuat tercatat di setiap harimu."
                  : "See the strongest emotion recorded on each day."}
              </p>
            </div>
          </div>
        </header>

        {/* MAIN CARD */}
        {/* Kurangi padding di mobile (p-4) dan gunakan rounded-3xl */}
        <section className="rounded-3xl border border-[#4A3F35]/10 bg-[#FDFBF7] p-4 sm:p-6 md:rounded-[2rem] md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

            {/* CALENDAR */}
            <div className="min-w-0">
              <div className="mb-5 flex items-center justify-between gap-4 md:mb-6">
                <div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <CalendarIcon size={14} className="text-[#5C6B9C] md:h-4 md:w-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C6B9C] md:text-xs">
                      {isId ? "Kalender mood" : "Mood calendar"}
                    </span>
                  </div>

                  <h2 className="mt-1 text-lg font-semibold text-[#4A3F35] md:text-xl">
                    {getMonthName(year, month, locale)}
                  </h2>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#4A3F35]/10 text-[#4A3F35]/60 transition hover:border-[#5C6B9C]/30 hover:text-[#5C6B9C] md:h-9 md:w-9"
                    aria-label={isId ? "Bulan sebelumnya" : "Previous month"}
                  >
                    <ArrowIcon direction="left" size={14} className="md:h-4 md:w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#4A3F35]/10 text-[#4A3F35]/60 transition hover:border-[#5C6B9C]/30 hover:text-[#5C6B9C] md:h-9 md:w-9"
                    aria-label={isId ? "Bulan berikutnya" : "Next month"}
                  >
                    <ArrowIcon direction="right" size={14} className="md:h-4 md:w-4" />
                  </button>
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-[#E2725B]/20 bg-[#FBC4AB]/20 p-5 text-sm text-[#4A3F35]/75">
                  {error}
                </div>
              ) : (
                <>
                  {/* WEEKDAYS */}
                  {/* Tambahkan gap yang sama persis dengan kalender grid di bawahnya */}
                  <div className="mb-1 grid grid-cols-7 gap-1 sm:gap-1.5 md:mb-2 md:gap-2">
                    {(isId
                      ? ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
                      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                    ).map((label) => (
                      <div
                        key={label}
                        className="py-1 text-center text-[9px] font-medium uppercase tracking-wide text-[#4A3F35]/35 md:py-2 md:text-[10px]"
                      >
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* CALENDAR GRID */}
                  {/* Kecilkan gap untuk mobile (gap-1) */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2">
                    {calendarCells.map((cell) => {
                      if (cell.type === "empty") {
                        // Tambahkan w-full agar ukurannya konsisten
                        return <div key={cell.key} className="aspect-square w-full" />;
                      }

                      const dateKey = [
                        year,
                        String(month).padStart(2, "0"),
                        String(cell.day).padStart(2, "0"),
                      ].join("-");

                      const day = dayMap.get(dateKey);
                      const emotion = day ? getHighestEmotion(day.emotions) : null;
                      const selected = selectedDate === dateKey;
                      const isToday = todayKey === dateKey;

                      return (
                        <button
                          key={cell.key}
                          type="button"
                          onClick={() => setSelectedDate(dateKey)}
                          className={[
                            // HAPUS class min-h-*. Cukup gunakan w-full dan aspect-square 
                            // agar ukurannya otomatis membentuk kotak sempurna mengikuti grid
                            "group relative flex aspect-square w-full flex-col items-center justify-center rounded-lg border text-center transition sm:rounded-xl",
                            selected
                              ? "border-[#5C6B9C]/50 bg-[#5C6B9C]/8"
                              : "border-transparent hover:border-[#4A3F35]/10 hover:bg-[#4A3F35]/[0.03]",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "text-[10px] font-medium sm:text-xs",
                              isToday ? "text-[#E2725B]" : "text-[#4A3F35]/70",
                            ].join(" ")}
                          >
                            {cell.day}
                          </span>

                          {emotion ? (
                            <>
                              <div className="mt-0.5 flex h-6 w-6 items-center justify-center sm:mt-1 sm:h-9 sm:w-9 md:h-11 md:w-11">
                                <EmotionArtwork
                                  slug={emotion.slug}
                                  name={emotion.name}
                                  className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10"
                                />
                              </div>

                              <span className="mt-0.5 text-[8px] font-medium text-[#4A3F35]/40 sm:text-[9px]">
                                {emotion.intensity}/5
                              </span>
                            </>
                          ) : (
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full border border-[#4A3F35]/10 sm:mt-2 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5" />
                          )}

                          {isToday && (
                            <span className="absolute inset-x-2 bottom-1 h-px bg-[#E2725B]/50 sm:inset-x-3" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* LEGEND */}
                  <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[#4A3F35]/8 pt-4 text-[11px] text-[#4A3F35]/50">
                    <span className="font-medium text-[#4A3F35]/65">
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
                                ? "bg-[#5C6B9C]"
                                : level === 2
                                  ? "bg-[#C1D5C0]"
                                  : level === 3
                                    ? "bg-[#FBC4AB]"
                                    : level === 4
                                      ? "bg-[#E2725B]"
                                      : "bg-[#4A3F35]",
                            ].join(" ")}
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
            <aside className="border-t border-[#4A3F35]/8 pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {loading ? (
                <div className="flex min-h-[320px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#5C6B9C]/20 border-t-[#5C6B9C]" />

                    <p className="text-sm text-[#4A3F35]/50">
                      {isId
                        ? "Memuat kalender..."
                        : "Loading calendar..."}
                    </p>
                  </div>
                </div>
              ) : selectedDay ? (
                <div>
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5C6B9C]">
                      {isId
                        ? "Detail hari"
                        : "Day detail"}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold leading-tight text-[#4A3F35]">
                      {formatDate(
                        selectedDay.date,
                        locale,
                      )}
                    </h3>
                  </div>

                  {selectedEmotion ? (
                    <div>
                      <div className="rounded-[1.5rem] bg-[#FBC4AB]/25 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex h-16 w-16 items-center justify-center">
                              <EmotionArtwork
                                slug={
                                  selectedEmotion.slug
                                }
                                name={
                                  selectedEmotion.name
                                }
                                size={64}
                              />
                            </div>

                            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#5C6B9C]">
                              {isId
                                ? "Emosi utama hari ini"
                                : "Main emotion today"}
                            </p>

                            <h4 className="mt-1 text-2xl font-semibold text-[#4A3F35]">
                              {getEmotionLabel(selectedEmotion, isId)}
                            </h4>
                          </div>

                          <div className="text-right">
                            <span className="text-2xl font-semibold text-[#4A3F35]">
                              {
                                selectedEmotion.intensity
                              }
                            </span>

                            <span className="text-sm text-[#4A3F35]/40">
                              /5
                            </span>
                          </div>
                        </div>

                        <div className="mt-6">
                          <div className="mb-2 flex justify-between text-[11px] text-[#4A3F35]/45">
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

                          <div className="h-2 overflow-hidden rounded-full bg-[#FDFBF7]">
                            <div
                              className="h-full rounded-full bg-[#E2725B]"
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
                          <div className="mt-6 border-t border-[#4A3F35]/10 pt-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4A3F35]/40">
                              {isId
                                ? "Catatan"
                                : "Note"}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-[#4A3F35]/70">
                              {
                                selectedEmotion.note
                              }
                            </p>
                          </div>
                        )}
                      </div>

                      {selectedDay.contexts.length > 0 && (
                        <div className="mt-6">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4A3F35]/40">
                            {isId ? "Konteks" : "Context"}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedDay.contexts.map((context) => (
                              <span
                                key={context.id}
                                className="rounded-full bg-[#C1D5C0]/25 px-3 py-1.5 text-xs text-[#4A3F35]/70"
                              >
                                {/* 3. Panggil fungsi dengan isId */}
                                {getContextLabel(context, isId)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedDay.diary
                        ?.content && (
                        <div className="mt-6 border-t border-[#4A3F35]/8 pt-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4A3F35]/40">
                            {isId
                              ? "Diary"
                              : "Diary"}
                          </p>

                          <p className="mt-2 line-clamp-4 text-sm leading-6 text-[#4A3F35]/60">
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
                          className="mt-6 flex items-center justify-between rounded-xl border border-[#4A3F35]/10 px-4 py-3 text-sm font-medium text-[#4A3F35]/70 transition hover:border-[#5C6B9C]/30 hover:text-[#5C6B9C]"
                        >
                          <span>
                            {isId
                              ? "Lihat check-in"
                              : "View check-in"}
                          </span>

                          <ChevronRightIcon
                            size={16}
                          />
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="flex min-h-[320px] items-center justify-center text-center">
                      <div>
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#C1D5C0]/25">
                          <HeartIcon
                            size={24}
                            className="text-[#5C6B9C]"
                          />
                        </div>

                        <h4 className="mt-4 text-base font-semibold text-[#4A3F35]">
                          {isId
                            ? "Belum ada mood"
                            : "No mood recorded"}
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-[#4A3F35]/50">
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
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FBC4AB]/25">
                      <CalendarIcon
                        size={24}
                        className="text-[#5C6B9C]"
                      />
                    </div>

                    <h4 className="mt-4 text-base font-semibold text-[#4A3F35]">
                      {isId
                        ? "Pilih tanggal"
                        : "Select a date"}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-[#4A3F35]/50">
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