"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { Locale } from "@/i18n/config";

type Diary = {
  id: string;
  content: string | null;
  entryType: "TEXT" | "VOICE";
  audioUrl: string | null;
  durationSeconds: number | null;
  checkinId: string | null;
  createdAt: string;
  aiAnalyses: Array<{
    id: string;
    summary: string;
    emotionalState: string | null;
    stressScore: number | null;
    riskLevel: string;
  }>;
  checkin: {
    emotions: Array<{
      intensity: number;
      emotion: {
        name: string;
        slug: string;
      };
    }>;
  } | null;
};

type Props = {
  locale: Locale;
  userName: string;
  nickname?: string | null;
};

function BookIcon({
  size = 18,
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
        d="M5.5 4.5H9.2C10.7 4.5 12 5.7 12 7.2V19C12 17.7 10.9 16.7 9.5 16.7H5.5C4.7 16.7 4 16 4 15.2V6C4 5.2 4.7 4.5 5.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 4.5H14.8C13.3 4.5 12 5.7 12 7.2V19C12 17.7 13.1 16.7 14.5 16.7H18.5C19.3 16.7 20 16 20 15.2V6C20 5.2 19.3 4.5 18.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon({
  size = 14,
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
        strokeWidth="1.6"
      />
      <path
        d="M7.5 3.5V7M16.5 3.5V7M3.5 9.5H20.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon({
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
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon({
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
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PenIcon({
  size = 15,
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
        d="M14.5 5.5L18.5 9.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4.5 19.5L5.4 15.2L15.9 4.7C16.7 3.9 18 3.9 18.8 4.7L19.3 5.2C20.1 6 20.1 7.3 19.3 8.1L8.8 18.6L4.5 19.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

import type { SVGProps } from "react";

interface SparkleIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  filled?: boolean;
}

export function SparkleIcon({
  size = 18,
  filled = true,
  className = "",
  ...props
}: SparkleIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? "0" : "1.75"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Bintang Utama (Khas AI) */}
      <path d="M11.5 2C11.5 7.25 7.25 11.5 2 11.5C7.25 11.5 11.5 15.75 11.5 21C11.5 15.75 15.75 11.5 21 11.5C15.75 11.5 11.5 7.25 11.5 2Z" />
      
      {/* Kilau Sekunder (Kanan Atas) */}
      <path d="M19 2C19 3.66 17.66 5 16 5C17.66 5 19 6.34 19 8C19 6.34 20.34 5 22 5C20.34 5 19 3.66 19 2Z" />
      
      {/* Kilau Mini (Kanan Bawah) */}
      <path d="M19.5 16.5C19.5 17.6 18.6 18.5 17.5 18.5C18.6 18.5 19.5 19.4 19.5 20.5C19.5 19.4 20.4 18.5 21.5 18.5C20.4 18.5 19.5 17.6 19.5 16.5Z" />
    </svg>
  );
}

function ArrowRightIcon({
  size = 14,
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
    </svg>
  );
}

function LoadingSpinner({
  size = 15,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-current/20 border-t-current ${className}`}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}

const emotionArtwork: Record<string, string> = {
  happy: "/emotions-emoji/happy.webp",
  sad: "/emotions-emoji/sad.webp",
  angry: "/emotions-emoji/angry.webp",
  anxious: "/emotions-emoji/anxious.webp",
  stressed: "/emotions-emoji/stressed.webp",
  calm: "/emotions-emoji/calm.webp",
  tired: "/emotions-emoji/tired.webp",
  excited: "/emotions-emoji/excited.webp",
  lonely: "/emotions-emoji/lonely.webp",
  frustrated: "/emotions-emoji/frustrated.webp",
  hopeful: "/emotions-emoji/hopefulrev.png",
  loved: "/emotions-emoji/loved.webp",
  overwhelmed: "/emotions-emoji/overwhelmed.webp",
};

function getEmotionArtwork(slug: string) {
  const normalized = slug.toLowerCase().trim().replace(/\s+/g, "-");
  return emotionArtwork[normalized] ?? "/emotions-emoji/calm.webp";
}

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

function getEmotionColor(slug: string) {
  return emotionColors[slug?.toLowerCase()] ?? "#FBC4AB";
}

const emotionTranslations: Record<string, { en: string; id: string }> = {
  happy: { en: "Happy", id: "Bahagia" },
  loved: { en: "Loved", id: "Dicintai" },
  excited: { en: "Excited", id: "Antusias" },
  hopeful: { en: "Hopeful", id: "Bersyukur" },
  calm: { en: "Calm", id: "Tenang" },
  tired: { en: "Tired", id: "Lelah" },
  anxious: { en: "Anxious", id: "Cemas" },
  stressed: { en: "Stressed", id: "Tertekan" },
  angry: { en: "Angry", id: "Marah" },
  lonely: { en: "Lonely", id: "Kesepian" },
  sad: { en: "Sad", id: "Sedih" },
  overwhelmed: { en: "Overwhelmed", id: "Kewalahan" },
};

function getEmotionLabel(slug: string, isEnglish: boolean) {
  const translation = emotionTranslations[slug?.toLowerCase()];
  return translation ? (isEnglish ? translation.en : translation.id) : slug;
}

function EmotionArtwork({
  slug,
  name,
  size = 30,
}: {
  slug: string;
  name: string;
  size?: number;
}) {
  return (
    <Image
      src={getEmotionArtwork(slug)}
      alt={name}
      width={size}
      height={size}
      className="object-contain mix-blend-multiply"
    />
  );
}

export default function DiaryClient({ locale, userName, nickname }: Props) {
  const displayName = nickname?.trim() || userName.trim();

  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzingDiaryId, setAnalyzingDiaryId] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const isId = locale === "id";

  useEffect(() => {
    let cancelled = false;

    async function fetchDiaries() {
      try {
        setLoading(true);

        const response = await fetch("/api/diary", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              (isId ? "Gagal memuat diary." : "Failed to load diary."),
          );
        }

        if (!cancelled) {
          const safeDiaries = Array.isArray(data.diaries)
            ? data.diaries.filter(
                (item: unknown): item is Diary =>
                  typeof item === "object" &&
                  item !== null &&
                  "id" in item &&
                  "createdAt" in item,
              )
            : [];

          setDiaries(safeDiaries);
        }
      } catch (err) {
        console.error("[Diary]", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : isId
                ? "Gagal memuat diary."
                : "Failed to load your diary.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchDiaries();

    return () => {
      cancelled = true;
    };
  }, [isId]);

  async function handleCreateDiary() {
    if (!content.trim()) {
      setError(
        isId ? "Tulis sesuatu terlebih dahulu." : "Write something first.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          entryType: "TEXT",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (isId ? "Gagal membuat diary." : "Failed to create diary."),
        );
      }

      const newDiary: Diary = {
        ...data.diary,
        aiAnalyses: Array.isArray(data.diary?.aiAnalyses)
          ? data.diary.aiAnalyses
          : [],
        checkin: data.diary?.checkin ?? null,
      };

      setDiaries((current) => [newDiary, ...current]);
      setContent("");
      setShowComposer(false);
    } catch (err) {
      console.error("[Diary:create]", err);
      setError(
        err instanceof Error
          ? err.message
          : isId
            ? "Gagal menyimpan diary."
            : "Failed to save diary.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAnalyzeDiary(diaryId: string) {
    if (analyzingDiaryId) return;

    try {
      setAnalyzingDiaryId(diaryId);
      setError("");

      const response = await fetch("/api/ai/analyze-diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diaryId,
          language: locale === "id" ? "id" : "en",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.analysis) {
        throw new Error(
          result.error ||
            (isId ? "Analisis diary gagal." : "Diary analysis failed."),
        );
      }

      setDiaries((current) =>
        current.map((item) =>
          item.id === diaryId
            ? { ...item, aiAnalyses: [result.analysis] }
            : item,
        ),
      );
    } catch (err) {
      console.error("[Diary:analyze]", err);
      setError(
        err instanceof Error
          ? err.message
          : isId
            ? "Analisis diary gagal. Coba lagi."
            : "Diary analysis failed. Please try again.",
      );
    } finally {
      setAnalyzingDiaryId(null);
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat(isId ? "id-ID" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  }

  function formatTime(date: string) {
    return new Intl.DateTimeFormat(isId ? "id-ID" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-5 pb-20 text-[#4A3F35] sm:px-8 lg:px-10 ">
      <div className="mx-auto max-w-280">
        {/* PAGE INTRO */}
        <section className="border-b border-[#C1D5C0]/40 pb-8">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FBC4AB]/35">
                  <BookIcon size={14} className="text-[#5C6B9C]" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4A3F35]/40">
                  {isId ? "Ruang refleksi" : "Reflection space"}
                </span>
              </div>

        <h1 className="mt-5 text-[32px] font-semibold leading-[1.15] tracking-[-0.035em] text-[#4A3F35] sm:text-[40px]">
  {isId
    ? `Ruang kecil ${displayName}.`
    : `${displayName}'s little corner.`}
</h1>

              <p className="mt-3 max-w-xl text-[14px] leading-6 text-[#4A3F35]/55">
                {isId
                  ? "Tempat untuk berhenti sebentar, menulis apa yang kamu rasakan, dan melihat kembali perjalananmu."
                  : "A quiet place to pause, write what you feel, and look back at your journey."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowComposer(true);
                setError("");
              }}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[11px] bg-[#E2725B] px-5 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#D96852]"
            >
              <PlusIcon size={16} />
              {isId ? "Tulis sesuatu" : "Write something"}
            </button>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-6 border-l-2 border-[#E2725B] bg-[#E2725B]/10 px-4 py-3">
            <p className="text-xs text-[#4A3F35]">{error}</p>
          </div>
        )}

        {/* COMPOSER */}
        {showComposer && (
          <section className="mt-7 rounded-[22px] bg-[#FBC4AB]/22 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A3F35]/40">
                  {isId ? "Catatan baru" : "New reflection"}
                </p>

                <h2 className="mt-2 text-[22px] font-semibold tracking-tight text-[#4A3F35]">
                  {isId ? "Apa yang ada di pikiranmu?" : "What's on your mind?"}
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#4A3F35]/55">
                  {isId
                    ? "Tidak perlu rapi atau sempurna. Tulis saja apa adanya."
                    : "It doesn't have to be polished. Just put it into words."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowComposer(false);
                  setContent("");
                  setError("");
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#4A3F35]/40 transition hover:bg-[#FDFBF7]/60 hover:text-[#4A3F35]"
                aria-label={isId ? "Tutup" : "Close"}
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="mt-6">
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={
                  isId
                    ? "Tulis apa yang sedang ada di pikiranmu..."
                    : "Write what's on your mind..."
                }
                maxLength={10000}
                rows={9}
                className="w-full resize-none rounded-[15px] border border-[#4A3F35]/10 bg-[#FDFBF7]/80 p-5 text-sm leading-7 text-[#4A3F35] outline-none transition placeholder:text-[#4A3F35]/35 focus:border-[#E2725B]/60 focus:bg-[#FDFBF7] focus:ring-4 focus:ring-[#FBC4AB]/25"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[10px] text-[#4A3F35]/35">
                  {content.length}/10000
                </span>

                <button
                  type="button"
                  onClick={handleCreateDiary}
                  disabled={saving || !content.trim()}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#E2725B] px-5 text-xs font-semibold text-white transition hover:bg-[#D96852] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size={14} />
                      {isId ? "Menyimpan..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <PenIcon size={14} />
                      {isId ? "Simpan catatan" : "Save reflection"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* CONTENT */}
        <section className="mt-10">
          {loading ? (
            <div className="flex min-h-75 items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-[#4A3F35]/45">
                <LoadingSpinner size={16} />
                {isId ? "Membuka diary..." : "Opening your diary..."}
              </div>
            </div>
          ) : diaries.length === 0 ? (
            <EmptyDiary
              isId={isId}
              onCreate={() => {
                setShowComposer(true);
                setError("");
              }}
            />
          ) : (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4A3F35]/35">
                    {isId ? "Catatanmu" : "Your reflections"}
                  </p>

                  <p className="mt-1 text-sm text-[#4A3F35]/50">
                    {diaries.length}{" "}
                    {isId
                      ? "catatan"
                      : diaries.length === 1
                        ? "entry"
                        : "entries"}
                  </p>
                </div>
              </div>

              <div className="space-y-7">
                {diaries
                  .filter(Boolean)
                  .map((diary, index) => (
                    <DiaryEntry
                      key={diary.id}
                      diary={diary}
                      locale={locale}
                      isId={isId}
                      index={index}
                      analyzing={analyzingDiaryId === diary.id}
                      onAnalyzeDiary={handleAnalyzeDiary}
                      formatDate={formatDate}
                      formatTime={formatTime}
                    />
                  ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function DiaryEntry({
  diary,
  locale,
  isId,
  index,
  analyzing,
  onAnalyzeDiary,
  formatDate,
  formatTime,
}: {
  diary: Diary;
  locale: Locale;
  isId: boolean;
  index: number;
  analyzing: boolean;
  onAnalyzeDiary: (diaryId: string) => void;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
}) {
  const analysis = diary.aiAnalyses?.[0];

  return (
    <article className="group relative">
      <div className="absolute bottom-0 left-3.25 top-10 hidden w-px bg-[#C1D5C0]/35 sm:block" />

      <div className="relative grid gap-5 sm:grid-cols-[28px_1fr]">
        <div className="relative z-10 hidden sm:block">
          <span
            className={`mt-2 block h-2.5 w-2.5 rounded-full border-2 border-[#FDFBF7] ${
              index === 0 ? "bg-[#E2725B]" : "bg-[#C1D5C0]"
            }`}
          />
        </div>

        <div className="rounded-[20px] border border-[#C1D5C0]/45 bg-white/55 p-5 transition-colors group-hover:border-[#C1D5C0]/80 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium text-[#4A3F35]/40">
                <CalendarIcon size={14} />
                <span>{formatDate(diary.createdAt)}</span>
                <span>·</span>
                <span>{formatTime(diary.createdAt)}</span>
              </div>

              {diary.checkin?.emotions?.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {diary.checkin.emotions.map((item) => (
                    <span
                      key={`${diary.id}-${item.emotion.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold text-[#4A3F35]"
                      style={{
                        backgroundColor: `${getEmotionColor(item.emotion.slug)}25`,
                      }}
                    >
                      <EmotionArtwork
                        slug={item.emotion.slug}
                        name={getEmotionLabel(item.emotion.slug, !isId)}
                        size={22}
                      />
                      {getEmotionLabel(item.emotion.slug, !isId)}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {analysis && (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#C1D5C0]/25 px-2.5 py-1 text-[9px] font-semibold text-[#4A3F35]/55">
                <SparkleIcon size={12} className="text-[#5C6B9C]" />
                {isId ? "Sudah dianalisis" : "Analyzed"}
              </span>
            )}
          </div>

          <div className="mt-6 border-l-2 border-[#E2725B]/55 pl-5">
            <p className="whitespace-pre-wrap text-[14px] leading-7 text-[#4A3F35]/78">
              {diary.content}
            </p>
          </div>

          {analyzing && (
            <div className="mt-6 flex items-center gap-2 rounded-[12px] bg-[#C1D5C0]/20 px-4 py-3 text-[11px] text-[#4A3F35]/65">
              <LoadingSpinner size={14} className="text-[#5C6B9C]" />
              {isId
                ? "Reweave sedang membaca refleksimu..."
                : "Reweave is reflecting on your entry..."}
            </div>
          )}

          {analysis && (
            <div className="mt-7 rounded-[16px] bg-[#FBC4AB]/15 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FDFBF7]/75">
                  <SparkleIcon size={14} className="text-[#5C6B9C]" />
                </span>

                <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[#4A3F35]/45">
                  {isId ? "Refleksi dari Reweave" : "A reflection from Reweave"}
                </p>
              </div>

              <p className="mt-4 text-[13px] leading-6 text-[#4A3F35]/70">
                {analysis.summary}
              </p>

              {analysis.emotionalState && (
                <div className="mt-5 flex flex-wrap gap-5 border-t border-[#4A3F35]/10 pt-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#4A3F35]/35">
                      {isId ? "Kondisi emosional" : "Emotional state"}
                    </p>

                    <p className="mt-1 text-xs font-semibold capitalize text-[#4A3F35]/75">
                      {analysis.emotionalState}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!analysis && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => onAnalyzeDiary(diary.id)}
                disabled={analyzing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#5C6B9C]/25 bg-[#FDFBF7] px-4 text-xs font-semibold text-[#5C6B9C] transition hover:border-[#5C6B9C]/50 hover:bg-[#5C6B9C]/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {analyzing ? (
                  <>
                    <LoadingSpinner size={14} />
                    {isId ? "Menganalisis..." : "Analyzing..."}
                  </>
                ) : (
                  <>
                    <SparkleIcon size={14} />
                    {isId ? "Analisis dengan AI" : "Analyze with AI"}
                  </>
                )}
              </button>
              <p className="mt-2 text-[10px] leading-5 text-[#4A3F35]/45">
                {isId
                  ? "Analisis hanya berjalan saat kamu memilih tombol ini."
                  : "Analysis runs only when you choose this action."}
              </p>
            </div>
          )}

          {diary.checkinId && (
            <Link
              href={`/${locale}/moodlog/result/${diary.checkinId}`}
              className="mt-5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#5C6B9C] transition-colors hover:text-[#E2725B]"
            >
              {isId ? "Lihat check-in terkait" : "View related check-in"}
              <ArrowRightIcon size={14} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyDiary({
  isId,
  onCreate,
}: {
  isId: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#FBC4AB]/20 px-6 py-14 text-center sm:px-10">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#C1D5C0]/35" />

      <div className="relative mx-auto max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FDFBF7]/70">
          <BookIcon size={24} className="text-[#5C6B9C]" />
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-widest text-[#4A3F35]/35">
          {isId ? "Halaman masih kosong" : "A blank page"}
        </p>

        <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-[#4A3F35]">
          {isId ? "Mulai dari satu cerita." : "Start with one little story."}
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#4A3F35]/55">
          {isId
            ? "Tidak harus panjang. Bahkan beberapa kalimat tentang hari ini sudah cukup."
            : "It doesn't have to be long. A few honest sentences about today are enough."}
        </p>

        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#E2725B] px-5 text-xs font-semibold text-white transition hover:bg-[#D96852]"
        >
          <PenIcon size={14} />
          {isId ? "Tulis cerita pertama" : "Write your first story"}
        </button>
      </div>
    </div>
  );
}