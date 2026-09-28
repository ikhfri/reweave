"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Loader2,
  PenLine,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

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
};

export default function DiaryClient({
  locale,
  userName,
}: Props) {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzingDiaryId, setAnalyzingDiaryId] =
    useState<string | null>(null);

  const [showComposer, setShowComposer] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const isId = locale === "id";

  useEffect(() => {
    let cancelled = false;

    async function fetchDiaries() {
      try {
        const response = await fetch("/api/diary", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load diary",
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
        console.error(err);

        if (!cancelled) {
          setError(
            isId
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

    fetchDiaries();

    return () => {
      cancelled = true;
    };
  }, [isId]);

  async function handleCreateDiary() {
    if (!content.trim()) {
      setError(
        isId
          ? "Tulis sesuatu terlebih dahulu."
          : "Write something first.",
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
          data.error || "Failed to create diary",
        );
      }

      const newDiary: Diary = {
        ...data.diary,
        aiAnalyses: Array.isArray(
          data.diary?.aiAnalyses,
        )
          ? data.diary.aiAnalyses
          : [],
        checkin: data.diary?.checkin ?? null,
      };

      setDiaries((current) => [
        newDiary,
        ...current,
      ]);

      setContent("");
      setShowComposer(false);

      setAnalyzingDiaryId(newDiary.id);

      try {
        const aiResponse = await fetch(
          "/api/ai/analyze-diary",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              diaryId: newDiary.id,
              language: locale === "id" ? "id" : "en",
            }),
          },
        );

        const aiData = await aiResponse.json();

        if (!aiResponse.ok) {
          console.error(
            "Diary AI analysis failed:",
            aiData,
          );
        } else if (aiData.analysis) {
          setDiaries((current) =>
            current.map((item) =>
              item.id === newDiary.id
                ? {
                    ...item,
                    aiAnalyses: [
                      aiData.analysis,
                    ],
                  }
                : item,
            ),
          );
        }
      } catch (error) {
        console.error(
          "Diary AI analysis error:",
          error,
        );
      } finally {
        setAnalyzingDiaryId(null);
      }
    } catch (err) {
      console.error(err);

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

  function formatDate(date: string) {
    return new Intl.DateTimeFormat(
      isId ? "id-ID" : "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    ).format(new Date(date));
  }

  function formatTime(date: string) {
    return new Intl.DateTimeFormat(
      isId ? "id-ID" : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    ).format(new Date(date));
  }

  return (
    <main className="min-h-screen bg-[#fdfbf7] px-5 pb-20 pt-6 sm:px-8 lg:px-10 lg:pt-8">
      <div className="mx-auto max-w-[1120px]">
        {/* =====================================================
            PAGE INTRO
        ===================================================== */}
        <section className="border-b border-[#c1d5c0]/40 pb-8">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fbc4ab]/35">
                  <BookOpen
                    className="h-3.5 w-3.5 text-[#5c6b9c]"
                    strokeWidth={1.8}
                  />
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4a3f35]/40">
                  {isId
                    ? "Ruang refleksi"
                    : "Reflection space"}
                </span>
              </div>

              <h1 className="mt-5 text-[32px] font-semibold leading-[1.15] tracking-[-0.035em] text-[#4a3f35] sm:text-[40px]">
                {isId
                  ? `Cerita hari-hari ${userName}.`
                  : `${userName}'s little corner.`}
              </h1>

              <p className="mt-3 max-w-xl text-[14px] leading-6 text-[#4a3f35]/55">
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
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[11px] bg-[#e2725b] px-5 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#d96852]"
            >
              <Plus
                className="h-4 w-4"
                strokeWidth={1.8}
              />

              {isId
                ? "Tulis sesuatu"
                : "Write something"}
            </button>
          </div>
        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}
        {error && (
          <div className="mt-6 border-l-2 border-[#e2725b] bg-[#e2725b]/10 px-4 py-3">
            <p className="text-xs text-[#4a3f35]">
              {error}
            </p>
          </div>
        )}

        {/* =====================================================
            COMPOSER
        ===================================================== */}
        {showComposer && (
          <section className="mt-7 rounded-[22px] bg-[#fbc4ab]/22 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#4a3f35]/40">
                  {isId
                    ? "Catatan baru"
                    : "New reflection"}
                </p>

                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.025em] text-[#4a3f35]">
                  {isId
                    ? "Apa yang ada di pikiranmu?"
                    : "What's on your mind?"}
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#4a3f35]/55">
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
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#4a3f35]/40 transition hover:bg-[#fdfbf7]/60 hover:text-[#4a3f35]"
                aria-label={
                  isId ? "Tutup" : "Close"
                }
              >
                <X
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              </button>
            </div>

            <div className="mt-6">
              <textarea
                value={content}
                onChange={(event) =>
                  setContent(event.target.value)
                }
                placeholder={
                  isId
                    ? "Tulis apa yang sedang ada di pikiranmu..."
                    : "Write what's on your mind..."
                }
                maxLength={10000}
                rows={9}
                className="w-full resize-none rounded-[15px] border border-[#4a3f35]/10 bg-[#fdfbf7]/80 p-5 text-sm leading-7 text-[#4a3f35] outline-none transition placeholder:text-[#4a3f35]/35 focus:border-[#e2725b]/60 focus:bg-[#fdfbf7] focus:ring-4 focus:ring-[#fbc4ab]/25"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[10px] text-[#4a3f35]/35">
                  {content.length}/10000
                </span>

                <button
                  type="button"
                  onClick={handleCreateDiary}
                  disabled={
                    saving || !content.trim()
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#e2725b] px-5 text-xs font-semibold text-white transition hover:bg-[#d96852] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {isId
                        ? "Menyimpan..."
                        : "Saving..."}
                    </>
                  ) : (
                    <>
                      <PenLine
                        className="h-3.5 w-3.5"
                        strokeWidth={1.8}
                      />

                      {isId
                        ? "Simpan catatan"
                        : "Save reflection"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            CONTENT
        ===================================================== */}
        <section className="mt-10">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-[#4a3f35]/45">
                <Loader2 className="h-4 w-4 animate-spin" />

                {isId
                  ? "Membuka diary..."
                  : "Opening your diary..."}
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
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#4a3f35]/35">
                    {isId
                      ? "Catatanmu"
                      : "Your reflections"}
                  </p>

                  <p className="mt-1 text-sm text-[#4a3f35]/50">
                    {diaries.length}{" "}
                    {isId
                      ? diaries.length === 1
                        ? "catatan"
                        : "catatan"
                      : diaries.length === 1
                        ? "entry"
                        : "entries"}
                  </p>
                </div>
              </div>

              <div className="space-y-7">
                {diaries.filter(Boolean).map(
                  (diary, index) => (
                    <DiaryEntry
                      key={diary.id}
                      diary={diary}
                      locale={locale}
                      isId={isId}
                      index={index}
                      analyzing={
                        analyzingDiaryId === diary.id
                      }
                      formatDate={formatDate}
                      formatTime={formatTime}
                    />
                  ),
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   DIARY ENTRY
========================================================= */

function DiaryEntry({
  diary,
  locale,
  isId,
  index,
  analyzing,
  formatDate,
  formatTime,
}: {
  diary: Diary;
  locale: Locale;
  isId: boolean;
  index: number;
  analyzing: boolean;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
}) {
  const analysis = diary.aiAnalyses?.[0];

  return (
    <article className="group relative">
      {/* Timeline */}
      <div className="absolute bottom-0 left-[13px] top-10 hidden w-px bg-[#c1d5c0]/35 sm:block" />

      <div className="relative grid gap-5 sm:grid-cols-[28px_1fr]">
        {/* Timeline marker */}
        <div className="relative z-10 hidden sm:block">
          <span
            className={`mt-2 block h-[9px] w-[9px] rounded-full border-2 border-[#fdfbf7] ${
              index === 0
                ? "bg-[#e2725b]"
                : "bg-[#c1d5c0]"
            }`}
          />
        </div>

        {/* Content */}
        <div className="rounded-[20px] border border-[#c1d5c0]/45 bg-white/55 p-5 transition-colors group-hover:border-[#c1d5c0]/80 sm:p-7">
          {/* Meta */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium text-[#4a3f35]/40">
                <CalendarDays
                  className="h-3.5 w-3.5"
                  strokeWidth={1.6}
                />

                <span>
                  {formatDate(diary.createdAt)}
                </span>

                <span>·</span>

                <span>
                  {formatTime(diary.createdAt)}
                </span>
              </div>

              {diary.checkin?.emotions?.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {diary.checkin.emotions.map(
                    (item) => (
                      <span
                        key={`${diary.id}-${item.emotion.slug}`}
                        className="rounded-full bg-[#fbc4ab]/25 px-2.5 py-1 text-[9px] font-semibold text-[#5c6b9c]"
                      >
                        {item.emotion.name}
                      </span>
                    ),
                  )}
                </div>
              ) : null}
            </div>

            {analysis && (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#c1d5c0]/25 px-2.5 py-1 text-[9px] font-semibold text-[#4a3f35]/55">
                <Sparkles
                  className="h-3 w-3 text-[#5c6b9c]"
                  strokeWidth={1.7}
                />

                {isId
                  ? "Sudah dianalisis"
                  : "Analyzed"}
              </span>
            )}
          </div>

          {/* Diary text */}
          <div className="mt-6 border-l-2 border-[#e2725b]/55 pl-5">
            <p className="whitespace-pre-wrap text-[14px] leading-7 text-[#4a3f35]/78">
              {diary.content}
            </p>
          </div>

          {/* AI processing */}
          {analyzing && (
            <div className="mt-6 flex items-center gap-2 rounded-[12px] bg-[#c1d5c0]/20 px-4 py-3 text-[11px] text-[#4a3f35]/65">
              <Loader2
                className="h-3.5 w-3.5 animate-spin text-[#5c6b9c]"
                strokeWidth={1.8}
              />

              {isId
                ? "Moodify sedang membaca refleksimu..."
                : "Moodify is reflecting on your entry..."}
            </div>
          )}

          {/* AI analysis */}
          {analysis && (
            <div className="mt-7 rounded-[16px] bg-[#fbc4ab]/15 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fdfbf7]/75">
                  <Sparkles
                    className="h-3.5 w-3.5 text-[#5c6b9c]"
                    strokeWidth={1.7}
                  />
                </span>

                <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[#4a3f35]/45">
                  {isId
                    ? "Refleksi dari Moodify"
                    : "A reflection from Moodify"}
                </p>
              </div>

              <p className="mt-4 text-[13px] leading-6 text-[#4a3f35]/70">
                {analysis.summary}
              </p>

              {analysis.emotionalState && (
                <div className="mt-5 flex flex-wrap gap-5 border-t border-[#4a3f35]/10 pt-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#4a3f35]/35">
                      {isId
                        ? "Kondisi emosional"
                        : "Emotional state"}
                    </p>

                    <p className="mt-1 text-xs font-semibold capitalize text-[#4a3f35]/75">
                      {analysis.emotionalState}
                    </p>
                  </div>

                  {analysis.stressScore != null && (
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#4a3f35]/35">
                        {isId
                          ? "Skor stres"
                          : "Stress score"}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[#4a3f35]/75">
                        {analysis.stressScore}/100
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Check-in link */}
          {diary.checkinId && (
            <Link
              href={`/${locale}/check-in/result/${diary.checkinId}`}
              className="mt-5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#5c6b9c] transition-colors hover:text-[#e2725b]"
            >
              {isId
                ? "Lihat check-in terkait"
                : "View related check-in"}

              <ChevronRight
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
              />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyDiary({
  isId,
  onCreate,
}: {
  isId: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#fbc4ab]/20 px-6 py-14 text-center sm:px-10">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#c1d5c0]/35" />

      <div className="relative mx-auto max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fdfbf7]/70">
          <BookOpen
            className="h-6 w-6 text-[#5c6b9c]"
            strokeWidth={1.5}
          />
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#4a3f35]/35">
          {isId
            ? "Halaman masih kosong"
            : "A blank page"}
        </p>

        <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.025em] text-[#4a3f35]">
          {isId
            ? "Mulai dari satu cerita."
            : "Start with one little story."}
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#4a3f35]/55">
          {isId
            ? "Tidak harus panjang. Bahkan beberapa kalimat tentang hari ini sudah cukup."
            : "It doesn't have to be long. A few honest sentences about today are enough."}
        </p>

        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#e2725b] px-5 text-xs font-semibold text-white transition hover:bg-[#d96852]"
        >
          <PenLine
            className="h-3.5 w-3.5"
            strokeWidth={1.8}
          />

          {isId
            ? "Tulis cerita pertama"
            : "Write your first story"}
        </button>
      </div>
    </div>
  );
}
