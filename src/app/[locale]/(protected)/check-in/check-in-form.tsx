"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Check,
  Heart,
  Loader2,
  MessageCircle,
  Minus,
  Plus,
  Smile,
  Sparkles,
} from "lucide-react";

import type { Locale } from "@/i18n/config";

type Emotion = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
};

type Context = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};

type SelectedEmotion = {
  slug: string;
  intensity: number;
  note: string;
};

type Props = {
  locale: Locale;
  userName: string;
};

export default function CheckInForm({
  locale,
  userName,
}: Props) {
  const router = useRouter();

  const isEnglish = locale === "en";

  // =========================================================
  // DATA FROM DATABASE
  // =========================================================

  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);

  const [isLoadingOptions, setIsLoadingOptions] =
    useState(true);

  // =========================================================
  // FORM STATE
  // =========================================================

  const [selectedEmotions, setSelectedEmotions] =
    useState<SelectedEmotion[]>([]);

  const [selectedContexts, setSelectedContexts] =
    useState<string[]>([]);

  // Daily Story
  const [note, setNote] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [savedCheckinId, setSavedCheckinId] =
    useState<string | null>(null);

  const [aiError, setAiError] = useState("");

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  // =========================================================
  // LOAD EMOTIONS + CONTEXTS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        setIsLoadingOptions(true);
        setError("");

        const response = await fetch(
          "/api/check-ins/options",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load check-in options.",
          );
        }

        if (cancelled) {
          return;
        }

        setEmotions(
          Array.isArray(data.emotions)
            ? data.emotions
            : [],
        );

        setContexts(
          Array.isArray(data.contexts)
            ? data.contexts
            : [],
        );
      } catch (loadError) {
        console.error(
          "Failed to load check-in options:",
          loadError,
        );

        if (!cancelled) {
          setError(
            isEnglish
              ? "Failed to load check-in options. Please try again."
              : "Gagal memuat pilihan check-in. Silakan coba lagi.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOptions(false);
        }
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, [isEnglish]);

  // =========================================================
  // EMOTION HELPERS
  // =========================================================

  function toggleEmotion(slug: string) {
    setSelectedEmotions((current) => {
      const alreadySelected = current.some(
        (emotion) => emotion.slug === slug,
      );

      if (alreadySelected) {
        return current.filter(
          (emotion) => emotion.slug !== slug,
        );
      }

      if (current.length >= 3) {
        return current;
      }

      return [
        ...current,
        {
          slug,
          intensity: 3,
          note: "",
        },
      ];
    });
  }

  function getSelectedEmotion(slug: string) {
    return selectedEmotions.find(
      (emotion) => emotion.slug === slug,
    );
  }

  function updateIntensity(
    slug: string,
    intensity: number,
  ) {
    const safeIntensity = Math.min(
      5,
      Math.max(1, intensity),
    );

    setSelectedEmotions((current) =>
      current.map((emotion) =>
        emotion.slug === slug
          ? {
              ...emotion,
              intensity: safeIntensity,
            }
          : emotion,
      ),
    );
  }

  function updateEmotionNote(
    slug: string,
    emotionNote: string,
  ) {
    setSelectedEmotions((current) =>
      current.map((emotion) =>
        emotion.slug === slug
          ? {
              ...emotion,
              note: emotionNote,
            }
          : emotion,
      ),
    );
  }

  // =========================================================
  // CONTEXT HELPERS
  // =========================================================

  function toggleContext(slug: string) {
    setSelectedContexts((current) =>
      current.includes(slug)
        ? current.filter(
            (item) => item !== slug,
          )
        : [...current, slug],
    );
  }

  // =========================================================
  // AI ANALYSIS
  // =========================================================

  async function analyzeCheckin(
    checkinId: string,
  ) {
    setIsAnalyzing(true);
    setAiError("");

    try {
      const analysisResponse = await fetch(
        "/api/ai/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            checkinId,
            language:
              locale === "id"
                ? "id"
                : "en",
          }),
        },
      );

      const analysisData =
        await analysisResponse.json();

      if (!analysisResponse.ok) {
        console.error(
          "AI analysis error:",
          analysisData,
        );

        if (
          analysisResponse.status === 503 ||
          analysisResponse.status === 429
        ) {
          setAiError(
            isEnglish
              ? "Your check-in was saved, but AI analysis is temporarily unavailable. Please try again."
              : "Check-in berhasil disimpan, tetapi analisis AI sedang tidak tersedia. Silakan coba lagi.",
          );

          return false;
        }

        setAiError(
          isEnglish
            ? "Your check-in was saved, but AI analysis could not be completed."
            : "Check-in berhasil disimpan, tetapi analisis AI tidak dapat diselesaikan.",
        );

        return false;
      }

      return true;
    } catch (analysisError) {
      console.error(
        "AI analysis error:",
        analysisError,
      );

      setAiError(
        isEnglish
          ? "AI analysis failed. Please try again."
          : "Analisis AI gagal. Silakan coba lagi.",
      );

      return false;
    } finally {
      setIsAnalyzing(false);
    }
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  async function handleSubmit() {
    setError("");
    setAiError("");

    if (selectedEmotions.length === 0) {
      setError(
        isEnglish
          ? "Please select at least one emotion."
          : "Pilih setidaknya satu emosi.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      // 1. SAVE CHECK-IN

      const checkinResponse = await fetch(
        "/api/check-ins",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emotions: selectedEmotions.map(
              (emotion) => ({
                name: emotion.slug,
                intensity: emotion.intensity,
                note:
                  emotion.note.trim() || null,
              }),
            ),
            contexts: selectedContexts,
            note: note.trim() || null,
          }),
        },
      );

      const checkinData =
        await checkinResponse.json();

      if (!checkinResponse.ok) {
        console.error(
          "Check-in API error:",
          checkinData,
        );

        // If today's check-in already exists,
        // reuse it so AI analysis can be retried.
        if (
          checkinResponse.status === 409 &&
          checkinData?.checkinId
        ) {
          const existingCheckinId =
            checkinData.checkinId;

          setSavedCheckinId(
            existingCheckinId,
          );

          const success =
            await analyzeCheckin(
              existingCheckinId,
            );

          if (success) {
            router.push(
              `/${locale}/check-in/result/${existingCheckinId}`,
            );

            router.refresh();
          }

          return;
        }

        setError(
          checkinData.message ||
            (isEnglish
              ? "Failed to save your check-in."
              : "Gagal menyimpan check-in."),
        );

        return;
      }

      const checkinId =
        checkinData?.checkin?.id;

      if (!checkinId) {
        console.error(
          "Check-in ID missing:",
          checkinData,
        );

        setError(
          isEnglish
            ? "Check-in was saved but its ID could not be found."
            : "Check-in berhasil disimpan tetapi ID tidak ditemukan.",
        );

        return;
      }

      setSavedCheckinId(checkinId);

      // 2. GENERATE AI ANALYSIS

      const success =
        await analyzeCheckin(checkinId);

      // 3. GO TO AI RESULT

      if (success) {
        router.push(
          `/${locale}/check-in/result/${checkinId}`,
        );

        router.refresh();
      }
    } catch (submitError) {
      console.error(
        "Failed to submit check-in:",
        submitError,
      );

      setError(
        isEnglish
          ? "Something went wrong. Please try again."
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoadingOptions) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbc4ab]/35">
              <Loader2
                className="h-5 w-5 animate-spin text-[#5c6b9c]"
                strokeWidth={1.8}
              />
            </div>

            <p className="text-sm text-[#4a3f35]/65">
              {isEnglish
                ? "Loading check-in..."
                : "Memuat check-in..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="mx-auto max-w-4xl">

      {/* HEADER
          Back button sengaja tidak ada di sini.
          Tombol Kembali sudah disediakan oleh
          DashboardShell / anti-slop navigation.
      */}

      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fbc4ab]/35">
            <Heart
              className="h-5 w-5 text-[#5c6b9c]"
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-[#5c6b9c]">
              {isEnglish
                ? `Hi, ${userName}`
                : `Hai, ${userName}`}
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-[-0.035em] text-[#4a3f35]">
              {isEnglish
                ? "How are you feeling today?"
                : "Bagaimana perasaanmu hari ini?"}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#4a3f35]/65">
              {isEnglish
                ? "There are no right or wrong answers. Just choose what feels closest to how you're feeling."
                : "Tidak ada jawaban benar atau salah. Pilih saja yang paling menggambarkan perasaanmu saat ini."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">

        {/* EMOTIONS */}

        <section className="rounded-2xl border border-[#e7ddd5] bg-[#fdfbf7] p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Smile
                  className="h-4 w-4 text-[#5c6b9c]"
                  strokeWidth={1.8}
                />

                <h2 className="text-sm font-semibold text-[#4a3f35]">
                  {isEnglish
                    ? "Choose your emotions"
                    : "Pilih emosimu"}
                </h2>
              </div>

              <p className="mt-1 text-xs text-[#4a3f35]/45">
                {isEnglish
                  ? "Choose up to 3 emotions."
                  : "Pilih maksimal 3 emosi."}
              </p>
            </div>

            <span className="rounded-full bg-[#c1d5c0]/45 px-3 py-1 text-xs font-medium text-[#4a3f35]/65">
              {selectedEmotions.length}/3
            </span>
          </div>

          {emotions.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-[#c1d5c0] bg-[#fdfbf7] p-6 text-center">
              <p className="text-sm text-[#4a3f35]/65">
                {isEnglish
                  ? "No emotions are available right now."
                  : "Belum ada pilihan emosi yang tersedia."}
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {emotions.map((emotion) => {
                const selected = Boolean(
                  getSelectedEmotion(
                    emotion.slug,
                  ),
                );

                const disabled =
                  !selected &&
                  selectedEmotions.length >=
                    3;

                return (
                  <button
                    key={emotion.id}
                    type="button"
                    onClick={() =>
                      toggleEmotion(
                        emotion.slug,
                      )
                    }
                    disabled={disabled}
                    className={`
                      relative flex min-h-[72px]
                      items-center justify-between
                      rounded-xl border px-4
                      text-left transition-all
                      ${
                        selected
                          ? "border-[#e2725b] bg-[#fbc4ab]/45 text-[#4a3f35]"
                          : "border-[#e7ddd5] bg-[#fdfbf7] text-[#4a3f35]/85 hover:border-[#fbc4ab] hover:bg-[#fdfbf7]"
                      }
                      ${
                        disabled
                          ? "cursor-not-allowed opacity-40"
                          : ""
                      }
                    `}
                  >
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {getEmotionLabel(
                          emotion,
                        )}
                      </span>

                      {emotion.category && (
                        <span className="mt-1 block text-[10px] capitalize text-[#4a3f35]/45">
                          {emotion.category}
                        </span>
                      )}
                    </div>

                    {selected && (
                      <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e2725b]">
                        <Check
                          className="h-3 w-3 text-white"
                          strokeWidth={2.5}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* SELECTED EMOTIONS */}

          {selectedEmotions.length > 0 && (
            <div className="mt-7 border-t border-[#eee6df] pt-6">
              <div>
                <h3 className="text-sm font-semibold text-[#4a3f35]">
                  {isEnglish
                    ? "Tell us more about each emotion"
                    : "Ceritakan lebih banyak tentang setiap emosi"}
                </h3>

                <p className="mt-1 text-xs text-[#4a3f35]/45">
                  {isEnglish
                    ? "Rate the intensity and optionally tell us why you feel this way."
                    : "Nilai intensitasnya dan ceritakan secara singkat kenapa kamu merasa seperti ini."}
                </p>
              </div>

              <div className="mt-5 space-y-5">
                {selectedEmotions.map(
                  (selectedEmotion) => {
                    const emotion =
                      emotions.find(
                        (item) =>
                          item.slug ===
                          selectedEmotion.slug,
                      );

                    if (!emotion) {
                      return null;
                    }

                    return (
                      <div
                        key={
                          selectedEmotion.slug
                        }
                        className="rounded-xl border border-[#e7ddd5] bg-[#fdfbf7]/75 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-semibold text-[#4a3f35]">
                            {getEmotionLabel(
                              emotion,
                            )}
                          </span>

                          <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#fbc4ab]/55 px-2 text-sm font-bold text-[#4a3f35]">
                            {
                              selectedEmotion.intensity
                            }
                          </span>
                        </div>

                        {/* INTENSITY */}

                        <div className="mt-4 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              updateIntensity(
                                selectedEmotion.slug,
                                selectedEmotion.intensity -
                                  1,
                              )
                            }
                            disabled={
                              selectedEmotion.intensity <=
                              1
                            }
                            className="
                              flex h-9 w-9 shrink-0
                              items-center justify-center
                              rounded-lg border border-[#e7ddd5]
                              bg-[#fdfbf7] text-[#4a3f35]/65
                              transition
                              hover:border-[#fbc4ab]
                              hover:text-[#5c6b9c]
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                            aria-label={
                              isEnglish
                                ? "Decrease intensity"
                                : "Kurangi intensitas"
                            }
                          >
                            <Minus
                              className="h-4 w-4"
                              strokeWidth={2}
                            />
                          </button>

                          <div className="flex flex-1 items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map(
                              (level) => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() =>
                                    updateIntensity(
                                      selectedEmotion.slug,
                                      level,
                                    )
                                  }
                                  className={`
                                    h-2.5 flex-1 rounded-full
                                    transition-all
                                    ${
                                      level <=
                                      selectedEmotion.intensity
                                        ? "bg-[#fbc4ab]/350"
                                        : "bg-gray-200"
                                    }
                                  `}
                                  aria-label={`Intensity ${level}`}
                                />
                              ),
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              updateIntensity(
                                selectedEmotion.slug,
                                selectedEmotion.intensity +
                                  1,
                              )
                            }
                            disabled={
                              selectedEmotion.intensity >=
                              5
                            }
                            className="
                              flex h-9 w-9 shrink-0
                              items-center justify-center
                              rounded-lg border border-[#e7ddd5]
                              bg-[#fdfbf7] text-[#4a3f35]/65
                              transition
                              hover:border-[#fbc4ab]
                              hover:text-[#5c6b9c]
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                            aria-label={
                              isEnglish
                                ? "Increase intensity"
                                : "Tambah intensitas"
                            }
                          >
                            <Plus
                              className="h-4 w-4"
                              strokeWidth={2}
                            />
                          </button>
                        </div>

                        <div className="mt-2 flex justify-between text-[11px] text-[#4a3f35]/45">
                          <span>
                            {isEnglish
                              ? "Very low"
                              : "Sangat rendah"}
                          </span>

                          <span>
                            {isEnglish
                              ? "Very high"
                              : "Sangat tinggi"}
                          </span>
                        </div>

                        {/* EMOTION NOTE */}

                        <div className="mt-5 border-t border-[#e7ddd5] pt-4">
                          <label
                            htmlFor={`emotion-note-${selectedEmotion.slug}`}
                            className="text-xs font-medium text-[#4a3f35]/85"
                          >
                            {isEnglish
                              ? "Why do you feel this way?"
                              : "Kenapa kamu merasa seperti ini?"}
                          </label>

                          <p className="mt-1 text-[11px] leading-5 text-[#4a3f35]/45">
                            {isEnglish
                              ? "Optional. A short note helps Moodify understand this emotion."
                              : "Opsional. Catatan singkat membantu Moodify memahami emosi ini."}
                          </p>

                          <textarea
                            id={`emotion-note-${selectedEmotion.slug}`}
                            value={
                              selectedEmotion.note
                            }
                            onChange={(event) =>
                              updateEmotionNote(
                                selectedEmotion.slug,
                                event.target.value,
                              )
                            }
                            maxLength={500}
                            rows={2}
                            placeholder={
                              isEnglish
                                ? "What made you feel this way?"
                                : "Apa yang membuatmu merasa seperti ini?"
                            }
                            className="
                              mt-3 w-full resize-none
                              rounded-lg border border-[#e7ddd5]
                              bg-[#fdfbf7] px-3 py-2.5
                              text-sm leading-5 text-[#4a3f35]
                              outline-none transition
                              placeholder:text-[#4a3f35]/45
                              hover:border-[#c1d5c0]
                              focus:border-[#e2725b]
                              focus:ring-4
                              focus:ring-[#e2725b]/15
                            "
                          />

                          <div className="mt-1 text-right">
                            <span className="text-[10px] text-[#4a3f35]/45">
                              {
                                selectedEmotion.note
                                  .length
                              }
                              /500
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}
        </section>

        {/* CONTEXT */}

        <section className="rounded-2xl border border-[#e7ddd5] bg-[#fdfbf7] p-6 shadow-sm sm:p-7">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles
                className="h-4 w-4 text-[#5c6b9c]"
                strokeWidth={1.8}
              />

              <h2 className="text-sm font-semibold text-[#4a3f35]">
                {isEnglish
                  ? "What may be affecting you?"
                  : "Apa yang mungkin memengaruhimu?"}
              </h2>
            </div>

            <p className="mt-1 text-xs text-[#4a3f35]/45">
              {isEnglish
                ? "Optional. Choose anything that feels relevant."
                : "Opsional. Pilih hal yang terasa relevan."}
            </p>
          </div>

          {contexts.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-[#c1d5c0] bg-[#fdfbf7] p-6 text-center">
              <p className="text-sm text-[#4a3f35]/65">
                {isEnglish
                  ? "No contexts are available right now."
                  : "Belum ada konteks yang tersedia."}
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {contexts.map((context) => {
                const selected =
                  selectedContexts.includes(
                    context.slug,
                  );

                return (
                  <button
                    key={context.id}
                    type="button"
                    onClick={() =>
                      toggleContext(
                        context.slug,
                      )
                    }
                    className={`
                      flex min-h-[62px]
                      items-center justify-center
                      rounded-xl border px-3
                      text-center transition
                      ${
                        selected
                          ? "border-[#e2725b] bg-[#fbc4ab]/45 text-[#4a3f35]"
                          : "border-[#e7ddd5] bg-[#fdfbf7] text-[#4a3f35]/75 hover:border-[#fbc4ab] hover:bg-[#fdfbf7]"
                      }
                    `}
                  >
                    <span className="text-xs font-medium">
                      {getContextLabel(
                        context,
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* DAILY STORY */}

        <section className="rounded-2xl border border-[#e7ddd5] bg-[#fdfbf7] p-6 shadow-sm sm:p-7">
          <div>
            <div className="flex items-center gap-2">
              <MessageCircle
                className="h-4 w-4 text-[#5c6b9c]"
                strokeWidth={1.8}
              />

              <h2 className="text-sm font-semibold text-[#4a3f35]">
                {isEnglish
                  ? "Your Daily Story"
                  : "Cerita Harianmu"}
              </h2>
            </div>

            <p className="mt-1 text-xs text-[#4a3f35]/45">
              {isEnglish
                ? "Tell Moodify what happened today or what has been on your mind."
                : "Ceritakan apa yang terjadi hari ini atau apa yang sedang ada di pikiranmu."}
            </p>
          </div>

          <textarea
            value={note}
            onChange={(event) =>
              setNote(event.target.value)
            }
            maxLength={2000}
            rows={5}
            placeholder={
              isEnglish
                ? "Tell us about your day..."
                : "Ceritakan tentang harimu..."
            }
            className="
              mt-6 w-full resize-none
              rounded-xl border border-[#e7ddd5]
              bg-[#fdfbf7]/80
              px-4 py-3
              text-sm leading-6 text-[#4a3f35]
              outline-none
              transition
              placeholder:text-[#4a3f35]/45
              hover:border-[#c1d5c0]
              focus:border-[#e2725b]
              focus:bg-[#fdfbf7]
              focus:ring-4
              focus:ring-[#e2725b]/15
            "
          />

          <div className="mt-2 text-right">
            <span className="text-[11px] text-[#4a3f35]/45">
              {note.length}/2000
            </span>
          </div>
        </section>

        {/* AI ERROR */}

        {aiError && savedCheckinId && (
          <div className="rounded-xl border border-[#fbc4ab] bg-[#fbc4ab]/30 px-4 py-4">
            <p className="text-sm font-semibold text-[#4a3f35]">
              {isEnglish
                ? "Your check-in has been saved"
                : "Check-in kamu sudah tersimpan"}
            </p>

            <p className="mt-1 text-sm leading-5 text-[#4a3f35]/80">
              {aiError}
            </p>

            <button
              type="button"
              onClick={async () => {
                if (
                  !savedCheckinId ||
                  isAnalyzing
                ) {
                  return;
                }

                const success =
                  await analyzeCheckin(
                    savedCheckinId,
                  );

                if (success) {
                  router.push(
                    `/${locale}/check-in/result/${savedCheckinId}`,
                  );

                  router.refresh();
                }
              }}
              disabled={isAnalyzing}
              className="
                mt-3 inline-flex h-10
                items-center justify-center gap-2
                rounded-lg bg-[#e2725b]
                px-4 text-sm font-semibold
                text-white transition
                hover:bg-[#4a3f35]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isAnalyzing ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    strokeWidth={2}
                  />

                  {isEnglish
                    ? "Analyzing..."
                    : "Menganalisis..."}
                </>
              ) : (
                <>
                  <Sparkles
                    className="h-4 w-4"
                    strokeWidth={2}
                  />

                  {isEnglish
                    ? "Try AI Analysis Again"
                    : "Coba Analisis Lagi"}
                </>
              )}
            </button>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm leading-5 text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* SUBMIT */}

        <div className="flex items-center justify-between gap-4 border-t border-[#e7ddd5] pt-6">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c1d5c0]/45">
              <Heart
                className="h-4 w-4 text-[#4a3f35]/65"
                strokeWidth={1.8}
              />
            </div>

            <p className="text-xs text-[#4a3f35]/45">
              {isEnglish
                ? "Your entries are private."
                : "Catatanmu bersifat pribadi."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              isAnalyzing ||
              selectedEmotions.length === 0
            }
            className="
              group
              ml-auto inline-flex h-12
              min-w-[160px]
              items-center justify-center gap-2
              rounded-xl
              bg-[#e2725b]
              px-6
              text-sm font-semibold text-white
              shadow-sm
              transition-all
              hover:bg-[#4a3f35]
              hover:shadow-md
              focus:outline-none
              focus:ring-4
              focus:ring-[#e2725b]/20
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isSubmitting || isAnalyzing ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  strokeWidth={2}
                />

                {isAnalyzing
                  ? isEnglish
                    ? "Analyzing..."
                    : "Menganalisis..."
                  : isEnglish
                    ? "Saving..."
                    : "Menyimpan..."}
              </>
            ) : (
              <>
                {isEnglish
                  ? "Save check-in"
                  : "Simpan check-in"}

                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// LABEL HELPERS
// =========================================================

function getEmotionLabel(
  emotion: Emotion,
) {
  // Database remains the source of truth.
  // Until localized fields are added to the schema,
  // use the database name directly.

  return emotion.name;
}

function getContextLabel(
  context: Context,
) {
  // Database remains the source of truth.
  // Until localized fields are added to the schema,
  // use the database name directly.

  return context.name;
}