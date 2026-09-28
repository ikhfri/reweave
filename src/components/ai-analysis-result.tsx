"use client";

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

  /*
   * ============================================================
   * SAFE JSON PARSING
   * ============================================================
   */

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

  /*
   * ============================================================
   * DATA
   * ============================================================
   */

  const stressScore = Math.min(
    100,
    Math.max(0, analysis.stressScore ?? 0),
  );

  const emotions =
    analysis.checkin?.emotions ?? [];

  const contexts =
    analysis.checkin?.contexts ?? [];

  const diaryEntry =
    analysis.checkin?.diaryEntries?.[0] ?? null;

  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  function getSentimentLabel() {
    if (!analysis.sentiment) {
      return isEnglish
        ? "Not enough information"
        : "Belum cukup informasi";
    }

    const value =
      analysis.sentiment.toUpperCase();

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

  function getStressDescription() {
    if (stressScore >= 70) {
      return isEnglish
        ? "Your check-in suggests that today may have felt heavier than usual."
        : "Check-in-mu menunjukkan bahwa hari ini mungkin terasa lebih berat dari biasanya.";
    }

    if (stressScore >= 40) {
      return isEnglish
        ? "There are some signs of pressure in what you shared today."
        : "Ada beberapa tanda tekanan dari apa yang kamu ceritakan hari ini.";
    }

    return isEnglish
      ? "There are no strong signs of pressure in what you shared today."
      : "Tidak terlihat tanda tekanan yang kuat dari apa yang kamu ceritakan hari ini.";
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <main className="min-h-full bg-[#FDFBF7] pb-20 text-[#4A3F35]">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-7 lg:px-10 lg:py-14">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <section className="max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5C6B9C]">
            {isEnglish
              ? "A moment to look inward"
              : "Sebentar untuk melihat ke dalam diri"}
          </p>

          <h1 className="mt-5 text-[38px] font-semibold leading-[1.08] tracking-[-0.055em] sm:text-[52px]">
            {isEnglish
              ? "Your reflection."
              : "Refleksimu."}
          </h1>

          <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#4A3F35]/55 sm:text-[16px]">
            {isEnglish
              ? "A gentle look at what you shared today. Take what feels useful, and leave the rest."
              : "Sedikit melihat kembali apa yang kamu ceritakan hari ini. Ambil yang terasa berguna, dan tinggalkan sisanya."}
          </p>
        </section>

        {/* ======================================================
            SUMMARY
        ======================================================= */}

        <section className="mt-14">
          <div className="border-y border-[#C1D5C0]/60 py-10 sm:py-12">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
                {isEnglish
                  ? "What Moodify noticed"
                  : "Yang Moodify perhatikan"}
              </p>

              <p className="mt-7 text-[21px] leading-[1.75] tracking-[-0.015em] text-[#4A3F35]/80 sm:text-[24px]">
                {analysis.summary}
              </p>

              {analysis.validationMessage && (
                <div className="mt-8 border-l-2 border-[#E2725B] bg-[#FBC4AB]/25 px-5 py-5">
                  <p className="text-sm leading-7 text-[#4A3F35]/70">
                    {analysis.validationMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ======================================================
            EMOTIONAL STATE
        ======================================================= */}

        <section className="mt-16">
          <SectionHeading
            eyebrow={
              isEnglish
                ? "How today felt"
                : "Bagaimana hari ini terasa"
            }
            title={
              isEnglish
                ? "What was present."
                : "Apa yang terasa."
            }
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.7fr]">

            {/* EMOTIONAL STATE */}

            <div className="border-l-2 border-[#E2725B] pl-6 sm:pl-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4A3F35]/35">
                {isEnglish
                  ? "Emotional state"
                  : "Kondisi emosional"}
              </p>

              <h3 className="mt-4 text-[30px] font-semibold tracking-[-0.045em]">
                {analysis.emotionalState ||
                  (isEnglish
                    ? "Not enough information"
                    : "Belum cukup informasi")}
              </h3>

              {analysis.sentiment && (
                <p className="mt-3 text-sm text-[#4A3F35]/45">
                  {getSentimentLabel()}
                </p>
              )}
            </div>

            {/* STRESS */}

            <div className="border-t border-[#C1D5C0]/60 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4A3F35]/35">
                {isEnglish
                  ? "Pressure indicator"
                  : "Indikator tekanan"}
              </p>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-[40px] font-semibold tracking-[-0.05em]">
                  {stressScore}
                </span>

                <span className="text-xs text-[#4A3F35]/30">
                  / 100
                </span>
              </div>

              <div className="mt-5 h-1.5 w-full bg-[#C1D5C0]/30">
                <div
                  className="h-full bg-[#E2725B] transition-all"
                  style={{
                    width: `${stressScore}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-[11px] leading-5 text-[#4A3F35]/40">
                {getStressDescription()}
              </p>

              <p className="mt-2 text-[10px] leading-5 text-[#4A3F35]/30">
                {isEnglish
                  ? "This is a general wellbeing indicator, not a clinical measurement."
                  : "Ini adalah indikator wellbeing umum, bukan pengukuran klinis."}
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================
            EMOTIONS
        ======================================================= */}

        {emotions.length > 0 && (
          <section className="mt-16">
            <SectionHeading
              eyebrow={
                isEnglish
                  ? "Your emotions"
                  : "Emosimu"
              }
              title={
                isEnglish
                  ? "What you felt today."
                  : "Apa yang kamu rasakan hari ini."
              }
            />

            <div className="mt-8 divide-y divide-[#C1D5C0]/50 border-y border-[#C1D5C0]/50">
              {emotions.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-4 py-6 sm:grid-cols-[180px_1fr_auto] sm:items-start"
                >
                  <div>
                    <p className="text-[16px] font-semibold">
                      {item.emotion.name}
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#4A3F35]/30">
                      {isEnglish
                        ? "Intensity"
                        : "Intensitas"}
                    </p>
                  </div>

                  <div>
                    {item.note ? (
                      <p className="text-sm leading-7 text-[#4A3F35]/55">
                        {item.note}
                      </p>
                    ) : (
                      <p className="text-sm italic leading-7 text-[#4A3F35]/25">
                        {isEnglish
                          ? "No note added."
                          : "Tidak ada catatan."}
                      </p>
                    )}
                  </div>

                  <span className="text-sm font-semibold text-[#E2725B] sm:text-right">
                    {item.intensity}/5
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================
            CONTEXT
        ======================================================= */}

        {contexts.length > 0 && (
          <section className="mt-16">
            <SectionHeading
              eyebrow={
                isEnglish
                  ? "Around you"
                  : "Di sekitarmu"
              }
              title={
                isEnglish
                  ? "Things that were present."
                  : "Hal-hal yang ikut hadir."
              }
            />

            <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
              {contexts.map((item) => (
                <span
                  key={item.id}
                  className="border-b border-[#C1D5C0] pb-1 text-sm text-[#4A3F35]/65"
                >
                  {item.context.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================
            TRIGGERS
        ======================================================= */}

        {triggers.length > 0 && (
          <section className="mt-16">
            <SectionHeading
              eyebrow={
                isEnglish
                  ? "Possible influences"
                  : "Kemungkinan yang memengaruhi"
              }
              title={
                isEnglish
                  ? "Things worth noticing."
                  : "Hal yang mungkin perlu diperhatikan."
              }
            />

            <div className="mt-8 max-w-3xl space-y-5">
              {triggers.map((trigger, index) => (
                <div
                  key={`${trigger}-${index}`}
                  className="flex gap-5 border-b border-[#C1D5C0]/40 pb-5"
                >
                  <span className="pt-1 text-[10px] font-semibold text-[#E2725B]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <p className="text-sm leading-7 text-[#4A3F35]/60">
                    {trigger}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================
            THINKING PATTERNS
        ======================================================= */}

        {thinkingPatterns.length > 0 && (
          <section className="mt-16">
            <SectionHeading
              eyebrow={
                isEnglish
                  ? "A little awareness"
                  : "Sedikit kesadaran"
              }
              title={
                isEnglish
                  ? "Patterns Moodify noticed."
                  : "Pola yang Moodify perhatikan."
              }
            />

            <div className="mt-8 max-w-3xl space-y-5">
              {thinkingPatterns.map(
                (pattern, index) => (
                  <div
                    key={`${pattern}-${index}`}
                    className="border-l border-[#5C6B9C]/35 pl-5"
                  >
                    <p className="text-sm leading-7 text-[#4A3F35]/60">
                      {pattern}
                    </p>
                  </div>
                ),
              )}
            </div>

            <p className="mt-7 max-w-2xl text-[11px] leading-5 text-[#4A3F35]/30">
              {isEnglish
                ? "These are possible patterns based on what you shared, not diagnoses or fixed descriptions of you."
                : "Ini adalah kemungkinan pola berdasarkan apa yang kamu ceritakan, bukan diagnosis atau gambaran tetap tentang dirimu."}
            </p>
          </section>
        )}

        {/* ======================================================
            DAILY STORY
        ======================================================= */}

        {diaryEntry?.content && (
          <section className="mt-20">
            <div className="bg-[#FBC4AB]/25 px-7 py-9 sm:px-10 sm:py-11">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
                {isEnglish
                  ? "Your story"
                  : "Ceritamu"}
              </p>

              <h2 className="mt-4 text-[25px] font-semibold tracking-[-0.035em]">
                {isEnglish
                  ? "What you left here today."
                  : "Apa yang kamu tinggalkan di sini hari ini."}
              </h2>

              <p className="mt-7 whitespace-pre-wrap text-[16px] leading-[2] text-[#4A3F35]/70">
                {diaryEntry.content}
              </p>

              {diaryEntry.entryType === "VOICE" && (
                <p className="mt-6 text-[10px] uppercase tracking-[0.12em] text-[#4A3F35]/30">
                  {isEnglish
                    ? "Voice reflection"
                    : "Refleksi suara"}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ======================================================
            RECOMMENDATIONS
        ======================================================= */}

        {recommendations.length > 0 && (
          <section className="mt-20">
            <SectionHeading
              eyebrow={
                isEnglish
                  ? "Something gentle"
                  : "Sesuatu yang ringan"
              }
              title={
                isEnglish
                  ? "Things you could try."
                  : "Hal yang bisa kamu coba."
              }
            />

            <div className="mt-8 divide-y divide-[#C1D5C0]/50 border-y border-[#C1D5C0]/50">
              {recommendations.map(
                (recommendation, index) => (
                  <div
                    key={`${recommendation.title}-${index}`}
                    className="grid gap-4 py-7 sm:grid-cols-[55px_1fr]"
                  >
                    <span className="text-[10px] font-semibold tracking-[0.12em] text-[#E2725B]">
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <div>
                      <h3 className="text-[17px] font-semibold">
                        {recommendation.title}
                      </h3>

                      <p className="mt-2 max-w-2xl text-sm leading-7 text-[#4A3F35]/50">
                        {recommendation.description}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}

        {/* ======================================================
            SAFETY
        ======================================================= */}

        <section className="mt-20 border-t border-[#C1D5C0]/60 pt-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#C1D5C0]" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A3F35]/40">
                {isEnglish
                  ? "Your safety matters"
                  : "Keselamatanmu penting"}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <h2 className="text-[22px] font-semibold tracking-[-0.03em]">
                {isEnglish
                  ? "A note about this reflection."
                  : "Sedikit catatan tentang refleksi ini."}
              </h2>

              <span
                className={[
                  "text-[10px] font-semibold uppercase tracking-[0.1em]",
                  analysis.riskLevel === "HIGH"
                    ? "text-[#E2725B]"
                    : analysis.riskLevel ===
                        "MODERATE"
                      ? "text-[#5C6B9C]"
                      : "text-[#4A3F35]/35",
                ].join(" ")}
              >
                {getRiskLabel()}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#4A3F35]/45">
              {isEnglish
                ? "Moodify's reflections are designed to help you pause and understand your experience. They are not medical diagnoses."
                : "Refleksi Moodify dirancang untuk membantumu berhenti sejenak dan memahami pengalamanmu. Refleksi ini bukan diagnosis medis."}
            </p>

            {analysis.riskLevel === "HIGH" && (
              <div className="mt-7 border-l-2 border-[#E2725B] bg-[#E2725B]/10 px-5 py-5">
                <p className="text-sm leading-7 text-[#4A3F35]/75">
                  {isEnglish
                    ? "If you feel that you may be in immediate danger or unable to keep yourself safe, please contact local emergency services or a trusted person now."
                    : "Jika kamu merasa berada dalam bahaya atau tidak dapat menjaga keselamatan diri, segera hubungi layanan darurat setempat atau orang yang kamu percaya."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ======================================================
            END ACTIONS
        ======================================================= */}

        <section className="mt-16 border-t border-[#C1D5C0]/50 pt-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-[11px] leading-5 text-[#4A3F35]/30">
              {isEnglish
                ? "You don't need to act on everything you read here. Keep what resonates."
                : "Kamu nggak harus melakukan semuanya dari sini. Simpan yang terasa berarti untukmu."}
            </p>

            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/${locale}/dashboard`,
                  )
                }
                className="text-xs font-semibold text-[#5C6B9C] transition-colors hover:text-[#4A3F35]"
              >
                {isEnglish
                  ? "Back to your space"
                  : "Kembali ke ruangmu"}{" "}
                →
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/${locale}/activities`,
                  )
                }
                className="text-xs font-semibold text-[#E2725B] transition-colors hover:text-[#4A3F35]"
              >
                {isEnglish
                  ? "Find something gentle"
                  : "Cari aktivitas ringan"}{" "}
                →
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================
            FOOTNOTE
        ======================================================= */}

        <section className="mt-12 flex justify-center">
          <p className="max-w-lg text-center text-[10px] leading-5 tracking-[0.04em] text-[#4A3F35]/20">
            {isEnglish
              ? "Moodify is a space for reflection, not a replacement for professional care."
              : "Moodify adalah ruang untuk refleksi, bukan pengganti bantuan profesional."}
          </p>
        </section>
      </div>
    </main>
  );
}

/*
 * ============================================================
 * SECTION HEADING
 * ============================================================
 */

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-[27px] font-semibold tracking-[-0.04em] text-[#4A3F35] sm:text-[31px]">
        {title}
      </h2>
    </div>
  );
}