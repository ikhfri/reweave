"use client";

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Heart,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

import type { Locale } from "@/i18n/config";

type Recommendation = {
  title: string;
  description: string;
};

type CheckinEmotion = {
  id: string;
  intensity: number;
  note: string | null;
  position?: number;
  emotion: {
    name: string;
    slug: string;
  };
};

type CheckinContext = {
  id: string;
  context: {
    name: string;
    slug: string;
  };
};

type DiaryEntry = {
  id: string;
  content: string | null;
  entryType?: string;
  createdAt?: Date | string;
};

type Analysis = {
  id: string;

  summary: string;

  validationMessage: string | null;

  stressScore: number | null;

  sentiment: string | null;

  emotionalState: string | null;

  possibleTriggers: unknown;

  thinkingPatterns: unknown;

  recommendations: unknown;

  riskLevel: string;

  model?: string | null;

  createdAt?: Date | string;

  updatedAt?: Date | string;

  checkin: {
    id?: string;

    emotions: CheckinEmotion[];

    contexts: CheckinContext[];

    diaryEntries: DiaryEntry[];
  } | null;
};

type Props = {
  locale: Locale;
  analysis: Analysis;
};

export default function AIAnalysisResult({
  locale,
  analysis,
}: Props) {
  const router = useRouter();

  const isEnglish = locale === "en";

  // --------------------------------------------------
  // Safe JSON parsing
  // --------------------------------------------------

  const triggers: string[] = Array.isArray(
    analysis.possibleTriggers,
  )
    ? analysis.possibleTriggers.filter(
        (item): item is string =>
          typeof item === "string",
      )
    : [];

  const thinkingPatterns: string[] =
    Array.isArray(analysis.thinkingPatterns)
      ? analysis.thinkingPatterns.filter(
          (item): item is string =>
            typeof item === "string",
        )
      : [];

  const recommendations: Recommendation[] =
    Array.isArray(analysis.recommendations)
      ? analysis.recommendations.filter(
          (item): item is Recommendation =>
            typeof item === "object" &&
            item !== null &&
            "title" in item &&
            "description" in item &&
            typeof item.title === "string" &&
            typeof item.description === "string",
        )
      : [];

  const stressScore = Math.min(
    100,
    Math.max(0, analysis.stressScore ?? 0),
  );

  const emotions =
    analysis.checkin?.emotions ?? [];

  const contexts =
    analysis.checkin?.contexts ?? [];

  const diaryEntry =
    analysis.checkin?.diaryEntries?.[0];

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  function getSentimentLabel() {
    if (!analysis.sentiment) {
      return isEnglish
        ? "Not enough information"
        : "Belum cukup informasi";
    }

    const value = analysis.sentiment.toUpperCase();

    if (isEnglish) {
      switch (value) {
        case "POSITIVE":
          return "Positive";

        case "NEGATIVE":
          return "Negative";

        case "NEUTRAL":
          return "Neutral";

        default:
          return analysis.sentiment;
      }
    }

    switch (value) {
      case "POSITIVE":
        return "Positif";

      case "NEGATIVE":
        return "Negatif";

      case "NEUTRAL":
        return "Netral";

      default:
        return analysis.sentiment;
    }
  }

  function getRiskLabel() {
    switch (analysis.riskLevel) {
      case "HIGH":
        return isEnglish
          ? "Needs attention"
          : "Perlu perhatian";

      case "MODERATE":
        return isEnglish
          ? "Moderate"
          : "Sedang";

      default:
        return isEnglish
          ? "Low"
          : "Rendah";
    }
  }

  return (
    <div className="mx-auto max-w-4xl pb-12">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="
            inline-flex items-center gap-2
            text-sm font-medium text-gray-500
            transition hover:text-gray-900
          "
        >
          <ArrowLeft
            className="h-4 w-4"
            strokeWidth={1.8}
          />

          {isEnglish ? "Back" : "Kembali"}
        </button>

        <div className="mt-7 flex items-start gap-4">
          <div
            className="
              flex h-12 w-12 shrink-0
              items-center justify-center
              rounded-xl bg-indigo-50
            "
          >
            <Sparkles
              className="h-5 w-5 text-indigo-600"
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-indigo-600">
              Moodify AI
            </p>

            <h1
              className="
                mt-1 text-3xl font-bold
                tracking-[-0.035em] text-gray-900
              "
            >
              {isEnglish
                ? "Your emotional reflection"
                : "Refleksi emosimu"}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              {isEnglish
                ? "Here's what Moodify noticed from today's check-in."
                : "Berikut yang Moodify pahami dari check-in kamu hari ini."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* ==================================================
            SUMMARY
        ================================================== */}

        <section
          className="
            rounded-2xl border border-gray-200
            bg-white p-6 shadow-sm sm:p-7
          "
        >
          <div className="flex items-center gap-2">
            <Brain
              className="h-4 w-4 text-indigo-600"
              strokeWidth={1.8}
            />

            <h2 className="text-sm font-semibold text-gray-900">
              {isEnglish
                ? "What Moodify noticed"
                : "Yang Moodify pahami"}
            </h2>
          </div>

          <p className="mt-5 text-lg leading-8 text-gray-800">
            {analysis.summary}
          </p>

          {analysis.validationMessage && (
            <div className="mt-5 rounded-xl bg-indigo-50 px-4 py-4">
              <p className="text-sm leading-6 text-indigo-900">
                {analysis.validationMessage}
              </p>
            </div>
          )}
        </section>

        {/* ==================================================
            EMOTIONAL STATE + STRESS
        ================================================== */}

        <div className="grid gap-6 sm:grid-cols-2">
          <section
            className="
              rounded-2xl border border-gray-200
              bg-white p-6 shadow-sm
            "
          >
            <div className="flex items-center gap-2">
              <Heart
                className="h-4 w-4 text-indigo-600"
                strokeWidth={1.8}
              />

              <h2 className="text-sm font-semibold text-gray-900">
                {isEnglish
                  ? "Emotional state"
                  : "Kondisi emosional"}
              </h2>
            </div>

            <p className="mt-4 text-base font-semibold text-gray-800">
              {analysis.emotionalState ||
                (isEnglish
                  ? "Not enough information"
                  : "Belum cukup informasi")}
            </p>

            <span
              className="
                mt-3 inline-flex rounded-full
                bg-gray-100 px-3 py-1
                text-xs font-medium
                capitalize text-gray-600
              "
            >
              {getSentimentLabel()}
            </span>
          </section>

          <section
            className="
              rounded-2xl border border-gray-200
              bg-white p-6 shadow-sm
            "
          >
            <div className="flex items-center gap-2">
              <TrendingUp
                className="h-4 w-4 text-indigo-600"
                strokeWidth={1.8}
              />

              <h2 className="text-sm font-semibold text-gray-900">
                {isEnglish
                  ? "Stress indicator"
                  : "Indikator tekanan"}
              </h2>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl font-bold text-gray-900">
                {stressScore}
              </span>

              <span className="mb-1 text-xs text-gray-400">
                / 100
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="
                  h-full rounded-full bg-indigo-500
                  transition-all
                "
                style={{
                  width: `${stressScore}%`,
                }}
              />
            </div>

            <p className="mt-3 text-[11px] leading-5 text-gray-400">
              {isEnglish
                ? "This is a general wellbeing indicator, not a clinical measurement."
                : "Ini adalah indikator wellbeing umum, bukan pengukuran klinis."}
            </p>
          </section>
        </div>

        {/* ==================================================
            TODAY'S EMOTIONS
        ================================================== */}

        {emotions.length > 0 && (
          <section
            className="
              rounded-2xl border border-gray-200
              bg-white p-6 shadow-sm sm:p-7
            "
          >
            <div className="flex items-center gap-2">
              <Heart
                className="h-4 w-4 text-indigo-600"
                strokeWidth={1.8}
              />

              <h2 className="text-sm font-semibold text-gray-900">
                {isEnglish
                  ? "Today's emotions"
                  : "Emosi hari ini"}
              </h2>
            </div>

            <div className="mt-5 space-y-3">
              {emotions.map((item) => (
                <div
                  key={item.id}
                  className="
                    rounded-xl border border-gray-100
                    bg-gray-50 p-4
                  "
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-gray-800">
                      {item.emotion.name}
                    </span>

                    <span
                      className="
                        rounded-lg bg-indigo-100
                        px-2.5 py-1 text-xs
                        font-bold text-indigo-700
                      "
                    >
                      {item.intensity}/5
                    </span>
                  </div>

                  {item.note && (
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {item.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================================================
            CONTEXTS
        ================================================== */}

        {contexts.length > 0 && (
          <section
            className="
              rounded-2xl border border-gray-200
              bg-white p-6 shadow-sm sm:p-7
            "
          >
            <div className="flex items-center gap-2">
              <Sparkles
                className="h-4 w-4 text-indigo-600"
                strokeWidth={1.8}
              />

              <h2 className="text-sm font-semibold text-gray-900">
                {isEnglish
                  ? "What may have influenced you"
                  : "Hal yang mungkin memengaruhi kamu"}
              </h2>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {contexts.map((item) => (
                <span
                  key={item.id}
                  className="
                    rounded-full border border-gray-200
                    bg-gray-50 px-3 py-1.5
                    text-xs font-medium text-gray-600
                  "
                >
                  {item.context.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ==================================================
            POSSIBLE TRIGGERS
        ================================================== */}

        {triggers.length > 0 && (
          <section
            className="
              rounded-2xl border border-gray-200
              bg-white p-6 shadow-sm sm:p-7
            "
          >
            <div className="flex items-center gap-2">
              <Sparkles
                className="h-4 w-4 text-indigo-600"
                strokeWidth={1.8}
              />

              <h2 className="text-sm font-semibold text-gray-900">
                {isEnglish
                  ? "Possible triggers"
                  : "Kemungkinan pemicu"}
              </h2>
            </div>

            <div className="mt-5 space-y-2">
              {triggers.map((trigger, index) => (
                <div
                  key={`${trigger}-${index}`}
                  className="
                    flex items-start gap-3
                    rounded-xl bg-gray-50
                    px-4 py-3
                  "
                >
                  <span
                    className="
                      mt-1.5 h-1.5 w-1.5
                      shrink-0 rounded-full
                      bg-indigo-500
                    "
                  />

                  <p className="text-sm leading-6 text-gray-600">
                    {trigger}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================================================
            THINKING PATTERNS
        ================================================== */}

        {thinkingPatterns.length > 0 && (
          <section
            className="
              rounded-2xl border border-gray-200
              bg-white p-6 shadow-sm sm:p-7
            "
          >
            <div className="flex items-center gap-2">
              <Brain
                className="h-4 w-4 text-indigo-600"
                strokeWidth={1.8}
              />

              <h2 className="text-sm font-semibold text-gray-900">
                {isEnglish
                  ? "Possible patterns"
                  : "Kemungkinan pola"}
              </h2>
            </div>

            <div className="mt-5 space-y-2">
              {thinkingPatterns.map(
                (pattern, index) => (
                  <div
                    key={`${pattern}-${index}`}
                    className="
                      rounded-xl bg-gray-50
                      px-4 py-3
                    "
                  >
                    <p className="text-sm leading-6 text-gray-600">
                      {pattern}
                    </p>
                  </div>
                ),
              )}
            </div>

            <p className="mt-4 text-[11px] leading-5 text-gray-400">
              {isEnglish
                ? "These are possible patterns based on your entry, not diagnoses."
                : "Ini adalah kemungkinan pola berdasarkan ceritamu, bukan diagnosis."}
            </p>
          </section>
        )}

        {/* ==================================================
            DAILY STORY
        ================================================== */}

        {diaryEntry?.content && (
          <section
            className="
              rounded-2xl border border-gray-200
              bg-white p-6 shadow-sm sm:p-7
            "
          >
            <div className="flex items-center gap-2">
              <Heart
                className="h-4 w-4 text-indigo-600"
                strokeWidth={1.8}
              />

              <h2 className="text-sm font-semibold text-gray-900">
                {isEnglish
                  ? "Your Daily Story"
                  : "Cerita Harianmu"}
              </h2>
            </div>

            <p
              className="
                mt-5 whitespace-pre-wrap
                text-sm leading-7 text-gray-600
              "
            >
              {diaryEntry.content}
            </p>
          </section>
        )}

        {/* ==================================================
            RECOMMENDATIONS
        ================================================== */}

        {recommendations.length > 0 && (
          <section
            className="
              rounded-2xl border border-gray-200
              bg-white p-6 shadow-sm sm:p-7
            "
          >
            <div className="flex items-center gap-2">
              <Lightbulb
                className="h-4 w-4 text-indigo-600"
                strokeWidth={1.8}
              />

              <h2 className="text-sm font-semibold text-gray-900">
                {isEnglish
                  ? "What might help"
                  : "Apa yang mungkin membantu"}
              </h2>
            </div>

            <div className="mt-5 space-y-3">
              {recommendations.map(
                (recommendation, index) => (
                  <div
                    key={`${recommendation.title}-${index}`}
                    className="
                      group flex items-start
                      justify-between gap-4
                      rounded-xl border
                      border-gray-100
                      bg-gray-50 p-4
                      transition
                      hover:border-indigo-100
                      hover:bg-indigo-50/40
                    "
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        {recommendation.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {recommendation.description}
                      </p>
                    </div>

                    <ChevronRight
                      className="
                        mt-0.5 h-4 w-4 shrink-0
                        text-gray-300 transition
                        group-hover:translate-x-0.5
                        group-hover:text-indigo-500
                      "
                      strokeWidth={1.8}
                    />
                  </div>
                ),
              )}
            </div>
          </section>
        )}

        {/* ==================================================
            SAFETY STATUS
        ================================================== */}

        <section
          className="
            rounded-2xl border
            border-gray-200 bg-gray-50 p-5
          "
        >
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-gray-500"
              strokeWidth={1.8}
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-800">
                  {isEnglish
                    ? "Safety & wellbeing"
                    : "Keamanan & wellbeing"}
                </h2>

                <span
                  className={`
                    rounded-full px-2.5 py-1
                    text-[10px] font-semibold
                    ${
                      analysis.riskLevel === "HIGH"
                        ? "bg-red-100 text-red-700"
                        : analysis.riskLevel ===
                            "MODERATE"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {getRiskLabel()}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                {isEnglish
                  ? "Moodify's AI reflections are designed to support self-reflection and are not a medical diagnosis."
                  : "Refleksi AI Moodify dirancang untuk membantu memahami diri dan bukan merupakan diagnosis medis."}
              </p>

              {analysis.riskLevel === "HIGH" && (
                <p className="mt-3 text-xs font-medium leading-5 text-red-600">
                  {isEnglish
                    ? "If you feel that you may be in immediate danger or unable to keep yourself safe, please contact local emergency services or a trusted person now."
                    : "Jika kamu merasa berada dalam bahaya atau tidak dapat menjaga keselamatan diri, segera hubungi layanan darurat setempat atau orang yang kamu percaya."}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              router.push(`/${locale}/dashboard`)
            }
            className="
              inline-flex h-11
              items-center justify-center
              gap-2 rounded-xl
              border border-gray-200
              bg-white px-5
              text-sm font-semibold
              text-gray-700
              transition
              hover:border-gray-300
              hover:bg-gray-50
            "
          >
            {isEnglish
              ? "Go to dashboard"
              : "Ke dashboard"}

            <ArrowRight
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(`/${locale}/activities`)
            }
            className="
              inline-flex h-11
              items-center justify-center
              gap-2 rounded-xl
              bg-indigo-600 px-5
              text-sm font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-indigo-700
            "
          >
            <CheckCircle2
              className="h-4 w-4"
              strokeWidth={1.8}
            />

            {isEnglish
              ? "Explore activities"
              : "Lihat aktivitas"}
          </button>
        </div>
      </div>
    </div>
  );
}