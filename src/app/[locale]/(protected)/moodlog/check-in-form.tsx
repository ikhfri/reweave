"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode, type SVGProps } from "react";
import { useRouter } from "next/navigation";
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
  nickname?: string | null;
};

const EMOTION_ORDER = [
  "happy",
  "loved",
  "excited",
  "hopeful",
  "calm",
  "tired",
  "anxious",
  "stressed",
  "angry",
  "lonely",
  "sad",
  "overwhelmed",
];

export default function CheckInForm({ locale, userName, nickname }: Props) {
  const router = useRouter();
  const isEnglish = locale === "en";

  const displayName = nickname?.trim() || userName.trim();

  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // =========================================================
  // FORM STATE
  // =========================================================
  const [selectedEmotions, setSelectedEmotions] = useState<SelectedEmotion[]>([]);
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [emotionDescription, setEmotionDescription] = useState("");
  const [unknownEmotionMode, setUnknownEmotionMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [savedCheckinId, setSavedCheckinId] = useState<string | null>(null);
  const [aiError, setAiError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        setIsLoadingOptions(true);
        setError("");

        const response = await fetch("/api/check-ins/options", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load check-in options.");
        }

        if (cancelled) return;

        const fetchedEmotions = Array.isArray(data.emotions) ? data.emotions : [];
        const sortedEmotions = [...fetchedEmotions].sort((a, b) => {
          const indexA = EMOTION_ORDER.indexOf(a.slug);
          const indexB = EMOTION_ORDER.indexOf(b.slug);
          const orderA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
          const orderB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

          return orderA - orderB;
        });

        setEmotions(sortedEmotions);
        setContexts(Array.isArray(data.contexts) ? data.contexts : []);
      } catch (loadError) {
        console.error("Failed to load check-in options:", loadError);

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

  function toggleEmotion(slug: string) {
    setSelectedEmotions((current) => {
      const alreadySelected = current.some((emotion) => emotion.slug === slug);

      if (alreadySelected) {
        return current.filter((emotion) => emotion.slug !== slug);
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
    return selectedEmotions.find((emotion) => emotion.slug === slug);
  }

  function updateIntensity(slug: string, intensity: number) {
    const safeIntensity = Math.min(5, Math.max(1, intensity));

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

  function updateEmotionNote(slug: string, emotionNote: string) {
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
  // UNKNOWN EMOTION MODE
  // =========================================================
  function enableUnknownEmotionMode() {
    setUnknownEmotionMode(true);
    setSelectedEmotions([]);
    setError("");
  }

  function disableUnknownEmotionMode() {
    setUnknownEmotionMode(false);
    setEmotionDescription("");
    setError("");
  }

  function toggleContext(slug: string) {
    setSelectedContexts((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  }

  async function analyzeCheckin(checkinId: string) {
    setIsAnalyzing(true);
    setAiError("");

    try {
      const analysisResponse = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkinId,
          language: locale === "id" ? "id" : "en",
        }),
      });

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok) {
        console.error("AI analysis error:", analysisData);

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
      console.error("AI analysis error:", analysisError);

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

  async function handleSubmit() {
    setError("");
    setAiError("");

    if (!unknownEmotionMode && selectedEmotions.length === 0) {
      setError(
        isEnglish
          ? "Please select at least one emotion."
          : "Pilih setidaknya satu emosi.",
      );
      return;
    }

    if (unknownEmotionMode && emotionDescription.trim().length === 0) {
      setError(
        isEnglish
          ? "Please describe what you are feeling."
          : "Ceritakan apa yang sedang kamu rasakan.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const checkinResponse = await fetch("/api/check-ins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emotions: unknownEmotionMode
            ? []
            : selectedEmotions.map((emotion) => ({
                name: emotion.slug,
                intensity: emotion.intensity,
                note: emotion.note.trim() || null,
              })),
          contexts: selectedContexts,
          note: note.trim() || null,
          emotionDescription: unknownEmotionMode
            ? emotionDescription.trim()
            : null,
        }),
      });

      const checkinData = await checkinResponse.json();

      if (!checkinResponse.ok) {
        console.error("Check-in API error:", checkinData);

        if (checkinResponse.status === 409 && checkinData?.checkinId) {
          const existingCheckinId = checkinData.checkinId;
          setSavedCheckinId(existingCheckinId);

          const success = await analyzeCheckin(existingCheckinId);

          if (success) {
            router.push(`/${locale}/moodlog/result/${existingCheckinId}`);
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

      const checkinId = checkinData?.checkin?.id;

      if (!checkinId) {
        console.error("Check-in ID missing:", checkinData);
        setError(
          isEnglish
            ? "Check-in was saved but its ID could not be found."
            : "Check-in berhasil disimpan tetapi ID tidak ditemukan.",
        );
        return;
      }

      setSavedCheckinId(checkinId);

      const success = await analyzeCheckin(checkinId);

      if (success) {
        router.push(`/${locale}/check-in/result/${checkinId}`);
        router.refresh();
      }
    } catch (submitError) {
      console.error("Failed to submit check-in:", submitError);
      setError(
        isEnglish
          ? "Something went wrong. Please try again."
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingOptions) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="flex min-h-125 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fbc4ab]/35">
              <SpinnerIcon className="h-5 w-5 animate-spin text-[#5c6b9c]" />
            </div>

            <p className="text-sm text-[#4a3f35]/55">
              {isEnglish
                ? "Preparing your check-in..."
                : "Menyiapkan check-in..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl pb-16 text-[#4a3f35]">
      <header className="mb-12 max-w-3xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-[#e2725b]" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5c6b9c]">
            {isEnglish ? "Daily check-in" : "Check-in harian"}
          </p>
        </div>

        <h1 className="text-4xl font-semibold tracking-[-0.045em] text-[#4a3f35] sm:text-5xl">
          {isEnglish
            ? `How are you feeling today, ${displayName}?`
            : `Bagaimana perasaanmu hari ini, ${displayName}?`}
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#4a3f35]/60 sm:text-[15px]">
          {isEnglish
            ? "Take a quiet moment to notice what is happening inside you. There is nothing you need to get right."
            : "Ambil sedikit waktu untuk memperhatikan apa yang sedang terjadi di dalam dirimu. Tidak ada jawaban yang harus dibuat sempurna."}
        </p>
      </header>

      <div className="space-y-16">
        <section>
          <div className="mb-7 flex items-end justify-between gap-5 border-b border-[#4a3f35]/10 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5c6b9c]">
                01
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {isEnglish
                  ? "What are you feeling?"
                  : "Apa yang sedang kamu rasakan?"}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#4a3f35]/50">
                {isEnglish
                  ? "Choose up to three emotions that feel closest to your experience."
                  : "Pilih maksimal tiga emosi yang paling mendekati apa yang sedang kamu rasakan."}
              </p>
            </div>

            <span className="hidden text-xs font-medium text-[#4a3f35]/35 sm:block">
              {selectedEmotions.length}/3
            </span>
          </div>

          {unknownEmotionMode ? null : emotions.length === 0 ? (
            <div className="border-y border-dashed border-[#c1d5c0] py-10 text-center">
              <p className="text-sm text-[#4a3f35]/60">
                {isEnglish
                  ? "No emotions are available right now."
                  : "Belum ada pilihan emosi yang tersedia."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 border-l border-t border-[#4a3f35]/10 sm:grid-cols-3 lg:grid-cols-4">
              {emotions.map((emotion) => {
                const selected = Boolean(getSelectedEmotion(emotion.slug));
                const disabled = !selected && selectedEmotions.length >= 3;

                return (
                  <button
                    key={emotion.id}
                    type="button"
                    onClick={() => toggleEmotion(emotion.slug)}
                    disabled={disabled}
                    style={
                      selected
                        ? {
                            backgroundColor: `${getEmotionColor(emotion.slug)}35`,
                          }
                        : undefined
                    }
                    className={[
                      "group relative min-h-26.25 flex flex-col justify-center border-b border-r border-[#4a3f35]/10 p-4 text-left transition-all sm:p-5",
                      !selected ? "bg-[#fdfbf7] hover:bg-[#fbc4ab]/10" : "",
                      disabled ? "cursor-not-allowed opacity-30" : "",
                    ].join(" ")}
                  >
                    {selected && (
                      <span
                        className="absolute left-0 top-0 h-full w-1"
                        style={{
                          backgroundColor: getEmotionColor(emotion.slug),
                        }}
                      />
                    )}

                    <div className="flex w-full items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={getEmotionImage(emotion.slug)}
                          alt={getEmotionLabel(emotion, isEnglish)}
                          width={52}
                          height={52}
                          className="h-13 w-13 shrink-0 object-contain"
                        />

                        <span
                          className="text-sm font-medium transition-colors"
                          style={{
                            color: selected
                              ? getEmotionColor(emotion.slug)
                              : "#4a3f35",
                          }}
                        >
                          {getEmotionLabel(emotion, isEnglish)}
                        </span>
                      </div>

                      {selected && (
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: getEmotionColor(emotion.slug),
                          }}
                        >
                          <CheckIcon className="h-3 w-3 text-white" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* SELECTED EMOTIONS */}
          {selectedEmotions.length > 0 && (
            <div className="mt-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#4a3f35]/10" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4a3f35]/35">
                  {isEnglish ? "A little deeper" : "Sedikit lebih dalam"}
                </span>
                <div className="h-px flex-1 bg-[#4a3f35]/10" />
              </div>

              <div className="space-y-8">
                {selectedEmotions.map((selectedEmotion) => {
                  const emotion = emotions.find(
                    (item) => item.slug === selectedEmotion.slug,
                  );

                  if (!emotion) return null;

                  return (
                    <article
                      key={selectedEmotion.slug}
                      className="grid gap-6 border-b border-[#4a3f35]/10 pb-8 lg:grid-cols-[0.7fr_1.3fr]"
                    >
                      {/* EMOTION INFO */}
                      <div>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-14 w-14 items-center justify-center rounded-2xl p-1.5"
                            style={{
                              backgroundColor: `${getEmotionColor(emotion.slug)}25`,
                            }}
                          >
                            <Image
                              src={getEmotionImage(emotion.slug)}
                              alt={getEmotionLabel(emotion, isEnglish)}
                              width={52}
                              height={52}
                              className="h-full w-full object-contain"
                            />
                          </div>

                          <div>
                            <span
                              className="mb-1 block h-1.5 w-8 rounded-full"
                              style={{
                                backgroundColor: getEmotionColor(emotion.slug),
                              }}
                            />
                            <h3 className="text-lg font-semibold">
                              {getEmotionLabel(emotion, isEnglish)}
                            </h3>
                          </div>
                        </div>

                        {emotion.description && (
                          <p className="mt-3 max-w-sm text-sm leading-6 text-[#4a3f35]/50">
                            {emotion.description}
                          </p>
                        )}
                      </div>

                      {/* INTENSITY + NOTE */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c6b9c]">
                            {isEnglish ? "Intensity" : "Intensitas"}
                          </span>

                          <span className="text-sm font-semibold text-[#e2725b]">
                            {selectedEmotion.intensity}/5
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              updateIntensity(
                                selectedEmotion.slug,
                                selectedEmotion.intensity - 1,
                              )
                            }
                            disabled={selectedEmotion.intensity <= 1}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#4a3f35]/10 text-[#4a3f35]/55 transition hover:border-[#e2725b] hover:text-[#e2725b] disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={
                              isEnglish
                                ? "Decrease intensity"
                                : "Kurangi intensitas"
                            }
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>

                          <div className="flex flex-1 gap-1.5">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() =>
                                  updateIntensity(selectedEmotion.slug, level)
                                }
                                className={[
                                  "h-2 flex-1 rounded-full transition-all duration-200",
                                  level <= selectedEmotion.intensity
                                    ? ""
                                    : "bg-[#4a3f35]/10",
                                ].join(" ")}
                                style={
                                  level <= selectedEmotion.intensity
                                    ? {
                                        backgroundColor: (
                                          {
                                            1: "#7FAF7B",
                                            2: "#A8C58A",
                                            3: "#D9C65B",
                                            4: "#F2A65A",
                                            5: "#E2725B",
                                          } as const
                                        )[level as 1 | 2 | 3 | 4 | 5],
                                      }
                                    : undefined
                                }
                                aria-label={`Intensity ${level}`}
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              updateIntensity(
                                selectedEmotion.slug,
                                selectedEmotion.intensity + 1,
                              )
                            }
                            disabled={selectedEmotion.intensity >= 5}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#4a3f35]/10 text-[#4a3f35]/55 transition hover:border-[#e2725b] hover:text-[#e2725b] disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={
                              isEnglish
                                ? "Increase intensity"
                                : "Tambah intensitas"
                            }
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="mt-2 flex justify-between text-[10px] text-[#4a3f35]/35">
                          <span>
                            {isEnglish ? "Very low" : "Sangat rendah"}
                          </span>
                          <span>
                            {isEnglish ? "Very high" : "Sangat tinggi"}
                          </span>
                        </div>

                        <label
                          htmlFor={`emotion-note-${selectedEmotion.slug}`}
                          className="mt-7 block text-xs font-semibold uppercase tracking-widest text-[#5c6b9c]"
                        >
                          {isEnglish
                            ? "What is behind it?"
                            : "Apa yang ada di baliknya?"}
                        </label>

                        <textarea
                          id={`emotion-note-${selectedEmotion.slug}`}
                          value={selectedEmotion.note}
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
                          className="mt-3 w-full resize-none border-b border-[#4a3f35]/15 bg-transparent px-0 py-3 text-sm leading-6 text-[#4a3f35] outline-none transition placeholder:text-[#4a3f35]/30 focus:border-[#e2725b]"
                        />

                        <div className="mt-1 text-right text-[10px] text-[#4a3f35]/30">
                          {selectedEmotion.note.length}/500
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* UNKNOWN EMOTION MODE TOGGLE */}
          <div className="mt-7">
            <button
              type="button"
              onClick={
                unknownEmotionMode
                  ? disableUnknownEmotionMode
                  : enableUnknownEmotionMode
              }
              className="inline-flex items-center gap-2 border-b border-[#5c6b9c]/40 pb-1 text-sm font-medium text-[#5c6b9c] transition hover:border-[#e2725b] hover:text-[#e2725b]"
            >
              <MessageIcon className="h-4 w-4" />
              {unknownEmotionMode
                ? isEnglish
                  ? "I know my emotion"
                  : "Saya tahu emosinya"
                : isEnglish
                  ? "I'm not sure what emotion this is"
                  : "Saya tidak yakin ini emosi apa"}
            </button>

            {unknownEmotionMode && (
              <div className="mt-8 bg-[#fbc4ab]/20 p-6 sm:p-8">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <MessageIcon className="h-5 w-5 text-[#e2725b]" />
                    <h3 className="text-lg font-semibold">
                      {isEnglish
                        ? "Tell us what you are feeling"
                        : "Ceritakan apa yang sedang kamu rasakan"}
                    </h3>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[#4a3f35]/55">
                    {isEnglish
                      ? "You don't need to know the name of the emotion. Just describe what is happening inside you."
                      : "Kamu tidak perlu tahu nama emosinya. Cukup ceritakan apa yang sedang terjadi di dalam dirimu."}
                  </p>

                  <textarea
                    value={emotionDescription}
                    onChange={(event) =>
                      setEmotionDescription(event.target.value)
                    }
                    maxLength={2000}
                    rows={7}
                    placeholder={
                      isEnglish
                        ? "For example: I don't know exactly what I'm feeling. Since this morning everything feels heavy, I don't feel like talking, and I just want some time alone..."
                        : "Contoh: Aku nggak tahu sebenarnya aku merasa apa. Dari pagi rasanya berat, nggak terlalu sedih tapi juga nggak punya energi buat ngobrol dan pengen sendiri..."
                    }
                    className="mt-6 min-h-45 w-full resize-none border-b border-[#4a3f35]/15 bg-transparent px-0 py-3 text-sm leading-7 text-[#4a3f35] outline-none transition placeholder:text-[#4a3f35]/30 focus:border-[#e2725b]"
                  />

                  <div className="mt-2 flex justify-between gap-4 text-[10px] text-[#4a3f35]/35">
                    <span>
                      {isEnglish
                        ? "Write naturally. There is no right or wrong answer."
                        : "Tulis dengan cara yang natural. Tidak ada jawaban benar atau salah."}
                    </span>
                    <span className="shrink-0">
                      {emotionDescription.length}/2000
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CONTEXTS */}
        <section>
          <div className="mb-7 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5c6b9c]">
              02
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {isEnglish
                ? "What has been around you?"
                : "Apa yang sedang ada di sekitarmu?"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#4a3f35]/50">
              {isEnglish
                ? "Optional. Choose anything that may have shaped how today feels."
                : "Opsional. Pilih hal yang mungkin ikut memengaruhi bagaimana harimu terasa."}
            </p>
          </div>

          {contexts.length === 0 ? (
            <div className="border-y border-dashed border-[#c1d5c0] py-10 text-center">
              <p className="text-sm text-[#4a3f35]/60">
                {isEnglish
                  ? "No contexts are available right now."
                  : "Belum ada konteks yang tersedia."}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-x-7 gap-y-5 border-y border-[#4a3f35]/10 py-7">
              {contexts.map((context) => {
                const selected = selectedContexts.includes(context.slug);

                return (
                  <button
                    key={context.id}
                    type="button"
                    onClick={() => toggleContext(context.slug)}
                    className="group inline-flex items-center gap-3 text-left"
                  >
                    <span
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                        selected
                          ? "border-[#e2725b] bg-[#e2725b]"
                          : "border-[#4a3f35]/20 group-hover:border-[#e2725b]",
                      ].join(" ")}
                    >
                      {selected && <CheckIcon className="h-3 w-3 text-white" />}
                    </span>

                    <span
                      className={[
                        "text-sm transition-colors",
                        selected
                          ? "font-medium text-[#4a3f35]"
                          : "text-[#4a3f35]/55 group-hover:text-[#4a3f35]",
                      ].join(" ")}
                    >
                      {getContextLabel(context, isEnglish)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* DAILY STORY */}
        <section>
          <div className="mb-7 grid gap-5 sm:grid-cols-[0.7fr_1.3fr] sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5c6b9c]">
                03
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {isEnglish ? "Tell your story" : "Ceritakan harimu"}
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-6 text-[#4a3f35]/50">
              {isEnglish
                ? "What happened today? What has been on your mind? Write as much or as little as feels right."
                : "Apa yang terjadi hari ini? Apa yang sedang memenuhi pikiranmu? Tulis sebanyak atau sesedikit yang terasa nyaman."}
            </p>
          </div>

          <div className="relative overflow-hidden bg-[#fbc4ab]/25 p-6 sm:p-8 lg:p-10">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#fdfbf7]/50" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <MessageIcon className="h-5 w-5 text-[#e2725b]" />
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c6b9c]">
                  {isEnglish ? "Your daily story" : "Cerita harianmu"}
                </span>
              </div>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={2000}
                rows={8}
                placeholder={
                  isEnglish
                    ? "Start wherever feels natural..."
                    : "Mulai dari mana pun yang terasa natural..."
                }
                className="mt-7 min-h-55 w-full resize-none border-0 bg-transparent px-0 py-0 text-base leading-8 text-[#4a3f35] outline-none placeholder:text-[#4a3f35]/35"
              />

              <div className="mt-6 flex items-center justify-between border-t border-[#4a3f35]/10 pt-4">
                <span className="text-xs text-[#4a3f35]/40">
                  {isEnglish
                    ? "Only share what feels comfortable."
                    : "Bagikan hanya hal yang terasa nyaman untukmu."}
                </span>

                <span className="text-[10px] text-[#4a3f35]/35">
                  {note.length}/2000
                </span>
              </div>
            </div>
          </div>
        </section>

        {aiError && savedCheckinId && (
          <section className="border-l-2 border-[#e2725b] bg-[#fbc4ab]/20 px-5 py-5 sm:px-6">
            <p className="text-sm font-semibold text-[#4a3f35]">
              {isEnglish
                ? "Your check-in has been saved"
                : "Check-in kamu sudah tersimpan"}
            </p>

            <p className="mt-2 text-sm leading-6 text-[#4a3f35]/65">
              {aiError}
            </p>

            <button
              type="button"
              onClick={async () => {
                if (!savedCheckinId || isAnalyzing) return;

                const success = await analyzeCheckin(savedCheckinId);
                if (success) {
                  router.push(`/${locale}/check-in/result/${savedCheckinId}`);
                  router.refresh();
                }
              }}
              disabled={isAnalyzing}
              className="mt-5 inline-flex h-10 items-center gap-2 border-b border-[#e2725b] text-sm font-medium text-[#4a3f35] transition hover:text-[#e2725b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  {isEnglish ? "Analyzing..." : "Menganalisis..."}
                </>
              ) : (
                <>
                  <SparkleIcon className="h-4 w-4" />
                  {isEnglish ? "Try AI analysis again" : "Coba analisis lagi"}
                </>
              )}
            </button>
          </section>
        )}

        {error && (
          <div className="border-l-2 border-red-400 bg-red-50/70 px-5 py-4">
            <p className="text-sm leading-6 text-red-600">{error}</p>
          </div>
        )}

        <section className="border-t border-[#4a3f35]/10 pt-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-md">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c1d5c0]/45">
                  <HeartIcon className="h-4 w-4 text-[#5c6b9c]" />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5c6b9c]">
                  {isEnglish
                    ? "A moment for yourself"
                    : "Sebentar untuk dirimu"}
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-[#4a3f35]/45">
                {isEnglish
                  ? "Your entries are private. Once saved, Reweave will create a reflection based on what you shared."
                  : "Catatanmu bersifat pribadi. Setelah disimpan, Reweave akan membuat refleksi berdasarkan apa yang kamu bagikan."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                isAnalyzing ||
                (!unknownEmotionMode && selectedEmotions.length === 0) ||
                (unknownEmotionMode && emotionDescription.trim().length === 0)
              }
              className="group inline-flex h-12 w-full items-center justify-center gap-3 bg-[#e2725b] px-7 text-sm font-semibold text-white transition-all hover:bg-[#4a3f35] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting || isAnalyzing ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
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
                  {isEnglish ? "Save check-in" : "Simpan check-in"}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

// =========================================================
// ASSETS & HELPERS
// =========================================================
const emotionImages: Record<string, string> = {
  happy: "/emotions-emoji/happy.webp",
  loved: "/emotions-emoji/loved.webp",
  excited: "/emotions-emoji/excited.webp",
  hopeful: "/emotions-emoji/hopefulrev.png",
  calm: "/emotions-emoji/calm.webp",
  tired: "/emotions-emoji/tired.webp",
  anxious: "/emotions-emoji/anxious.webp",
  stressed: "/emotions-emoji/stressed.webp",
  angry: "/emotions-emoji/angry.webp",
  lonely: "/emotions-emoji/lonely.webp",
  sad: "/emotions-emoji/sad.webp",
  overwhelmed: "/emotions-emoji/overwhelmed.webp",
};

function getEmotionImage(slug: string) {
  return emotionImages[slug.toLowerCase()] ?? "/emotions-emoji/calm.webp";
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
  return emotionColors[slug.toLowerCase()] ?? "#FBC4AB";
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

function getEmotionLabel(emotion: Emotion, isEnglish: boolean) {
  const translation = emotionTranslations[emotion.slug.toLowerCase()];
  if (translation) {
    return isEnglish ? translation.en : translation.id;
  }
  return emotion.name;
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
  work: { en: "Work", id: "Pekerjaan" },
  health: { en: "Health", id: "Kesehatan" },
  friends: { en: "Friends", id: "Teman" },
  weather: { en: "Weather", id: "Cuaca" },
};

function getContextLabel(context: Context, isEnglish: boolean) {
  const translation = contextTranslations[context.slug.toLowerCase()];
  if (translation) {
    return isEnglish ? translation.en : translation.id;
  }
  return context.name;
}

type IconProps = SVGProps<SVGSVGElement>;

function Icon({
  children,
  className,
  viewBox = "0 0 24 24",
}: IconProps & { children: ReactNode; viewBox?: string }) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M5 12.5 9.2 17 19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

function HeartIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12 20.2S4.2 15.4 4.2 9.7C4.2 6.8 6.2 5 8.7 5c1.5 0 2.7.7 3.3 1.8C12.6 5.7 13.8 5 15.3 5c2.5 0 4.5 1.8 4.5 4.7 0 5.7-7.8 10.5-7.8 10.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M4 12h15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m13 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

function MinusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M6 12h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Icon>
  );
}

function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12 6v12M6 12h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Icon>
  );
}

function MessageIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M5.2 6.4A3.4 3.4 0 0 1 8.6 3h6.8a3.4 3.4 0 0 1 3.4 3.4v4.8a3.4 3.4 0 0 1-3.4 3.4h-3.2l-4.4 3v-3H8.6a3.4 3.4 0 0 1-3.4-3.4V6.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

function SparkleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="m12 3 1.15 5.85L19 10l-5.85 1.15L12 17l-1.15-5.85L5 10l5.85-1.15L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m19 16 .55 2.45L22 19l-2.45.55L19 22l-.55-2.45L16 19l2.45-.55L19 16Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

function SpinnerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12 3a9 9 0 1 0 9 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Icon>
  );
}