"use client"
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

export default function DiaryClient({ locale, userName }: Props) {
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
      const response = await fetch("/api/diary", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load diary");
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
      throw new Error(data.error || "Failed to create diary");
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

    // Analyze the diary in the background so the diary is saved
    // immediately even if Gemini is temporarily unavailable.
    setAnalyzingDiaryId(newDiary.id);

    try {
      const aiResponse = await fetch("/api/ai/analyze-diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diaryId: newDiary.id,
          language: locale === "id" ? "id" : "en",
        }),
      });

      const aiData = await aiResponse.json();

      if (!aiResponse.ok) {
        console.error("Diary AI analysis failed:", aiData);
      } else if (aiData.analysis) {
        setDiaries((current) =>
          current.map((item) =>
            item.id === newDiary.id
              ? {
                  ...item,
                  aiAnalyses: [aiData.analysis],
                }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error("Diary AI analysis error:", error);
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
    <main className="min-h-screen bg-[#fdfbf7] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-[#5c6b9c]">
              <BookOpen className="h-4 w-4" />
              <span>
                {isId ? "Ruang Refleksi" : "Reflection Space"}
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#4a3f35] md:text-3xl">
              {isId
                ? `Diary ${userName}`
                : `${userName}'s Diary`}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4a3f35]/60">
              {isId
                ? "Tempat untuk menuliskan apa yang sedang kamu rasakan, pikirkan, atau alami hari ini."
                : "A private space to write about what you're feeling, thinking, or experiencing today."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowComposer(true);
              setError("");
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#e2725b] px-5 text-sm font-medium text-white shadow-[0_1px_3px_rgba(74,63,53,0.06)] transition hover:bg-[#c95f4c]"
          >
            <Plus className="h-4 w-4" />
            {isId ? "Tulis Diary" : "Write Diary"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Composer */}
        {showComposer && (
          <div className="mb-8 rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5 shadow-[0_1px_3px_rgba(74,63,53,0.06)] md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#4a3f35]">
                  {isId ? "Apa yang ingin kamu ceritakan?" : "What would you like to share?"}
                </h2>

                <p className="mt-1 text-sm text-[#4a3f35]/60">
                  {isId
                    ? "Tidak perlu sempurna. Tulis apa adanya."
                    : "It doesn't need to be perfect. Just write honestly."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowComposer(false);
                  setContent("");
                  setError("");
                }}
                className="rounded-lg p-2 text-[#4a3f35]/45 transition hover:bg-[#c1d5c0]/35 hover:text-[#4a3f35]/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={
                isId
                  ? "Tulis apa yang sedang ada di pikiranmu..."
                  : "Write what's on your mind..."
              }
              maxLength={10000}
              rows={8}
              className="w-full resize-none rounded-xl border border-[#4a3f35]/12 bg-[#fdfbf7]/80 p-4 text-sm leading-7 text-[#4a3f35] outline-none transition placeholder:text-[#4a3f35]/45 focus:border-[#e2725b] focus:bg-[#fdfbf7] focus:ring-4 focus:ring-[#fbc4ab]/35"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-[#4a3f35]/45">
                {content.length}/10000
              </span>

              <button
                type="button"
                onClick={handleCreateDiary}
                disabled={saving || !content.trim()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#e2725b] px-5 text-sm font-medium text-white transition hover:bg-[#c95f4c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isId ? "Menyimpan..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <PenLine className="h-4 w-4" />
                    {isId ? "Simpan Diary" : "Save Diary"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Diary list */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-[#4a3f35]/60">
              <Loader2 className="h-5 w-5 animate-spin" />
              {isId ? "Memuat diary..." : "Loading diary..."}
            </div>
          </div>
        ) : diaries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#4a3f35]/20 bg-[#fdfbf7] px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbc4ab]/35 text-[#5c6b9c]">
              <BookOpen className="h-6 w-6" />
            </div>

            <h2 className="font-semibold text-[#4a3f35]">
              {isId
                ? "Belum ada diary"
                : "No diary entries yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#4a3f35]/60">
              {isId
                ? "Mulai dengan menulis apa yang kamu rasakan hari ini."
                : "Start by writing down how you're feeling today."}
            </p>

            <button
              type="button"
              onClick={() => setShowComposer(true)}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#e2725b] px-4 text-sm font-medium text-white hover:bg-[#c95f4c]"
            >
              <Plus className="h-4 w-4" />
              {isId ? "Tulis Diary Pertama" : "Write Your First Diary"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {diaries.filter(Boolean).map((diary) => (
              <article
                key={diary.id}
                className="rounded-2xl border border-[#4a3f35]/12 bg-[#fdfbf7] p-5 transition hover:border-[#e2725b]/30 md:p-6"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#4a3f35]/45">
                      <CalendarDays className="h-4 w-4" />
                      <span>{formatDate(diary.createdAt)}</span>
                      <span>•</span>
                      <span>{formatTime(diary.createdAt)}</span>
                    </div>

                    {diary.checkin?.emotions?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {diary.checkin.emotions.map((item) => (
                          <span
                            key={`${diary.id}-${item.emotion.slug}`}
                            className="rounded-full bg-[#fbc4ab]/35 px-3 py-1 text-xs font-medium text-[#5c6b9c]"
                          >
                            {item.emotion.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {diary.aiAnalyses?.length > 0 && (
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#c1d5c0]/35 px-3 py-1.5 text-xs font-medium text-[#4a3f35]">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Analysis
                    </span>
                  )}
                </div>

                <p className="whitespace-pre-wrap text-sm leading-7 text-[#4a3f35]/85">
                  {diary.content}
                </p>

                {analyzingDiaryId === diary.id && (
                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#c1d5c0]/35 px-4 py-3 text-sm text-[#4a3f35]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isId
                      ? "Moodify sedang menganalisis diary..."
                      : "Moodify is analyzing your diary..."}
                  </div>
                )}

                {diary.aiAnalyses?.length > 0 && (
                  <div className="mt-5 rounded-xl bg-[#fdfbf7]/80 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#4a3f35]">
                      <Sparkles className="h-4 w-4 text-[#5c6b9c]" />
                      {isId
                        ? "Insight dari Moodify"
                        : "Moodify Insight"}
                    </div>

                    <p className="text-sm leading-6 text-[#4a3f35]/70">
                      {diary.aiAnalyses[0].summary}
                    </p>

                    {diary.aiAnalyses[0].emotionalState && (
                      <div className="mt-3 text-xs text-[#4a3f35]/60">
                        <span className="font-medium text-[#4a3f35]/85">
                          {isId ? "Emotional state:" : "Emotional state:"}
                        </span>{" "}
                        {diary.aiAnalyses[0].emotionalState}
                      </div>
                    )}
                  </div>
                )}

                {diary.checkinId && (
                  <Link
                    href={`/${locale}/check-in/result/${diary.checkinId}`}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#5c6b9c] hover:text-[#e2725b]"
                  >
                    {isId
                      ? "Lihat hasil check-in"
                      : "View check-in result"}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}