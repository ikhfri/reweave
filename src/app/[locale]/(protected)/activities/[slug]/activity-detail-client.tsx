/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

import {
  ActivityIcon,
  ArrowRightIcon,
  BackIcon,
  CheckinIcon,
  WellbeingIcon,
} from "@/components/moodify-icons";

type Activity = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  durationMinutes: number;
  difficulty: "EASY" | "MODERATE" | "ADVANCED";
  instructions: string;
};

type ActivityLog = {
  id: string;
  completed: boolean;
};

type Props = {
  locale: Locale;
  slug: string;
};

type PhaseAction =
  | "INHALE"
  | "HOLD"
  | "EXHALE"
  | "REST"
  | "GUIDE";

type ActivityPhase = {
  id: string;
  titleId: string;
  titleEn: string;
  instructionId: string;
  instructionEn: string;
  durationSeconds: number;
  action: PhaseAction;
};

type ActivityMode = "BREATHING" | "GUIDED";

/* ========================================================= */
/* TRANSLATIONS & HELPERS                                    */
/* ========================================================= */

const wellbeingTranslations: Record<
  string,
  {
    title: { en: string; id: string };
    description: { en: string; id: string };
    instructions: { en: string; id: string };
  }
> = {
  "box breathing": {
    title: { en: "Box Breathing", id: "Pernapasan Kotak" },
    description: {
      en: "A simple breathing exercise that can help you slow down and create a moment of calm.",
      id: "Latihan pernapasan sederhana yang dapat membantumu rileks dan menciptakan momen ketenangan.",
    },
    instructions: {
      en: "Breathe in for 4 seconds, hold for 4 seconds, breathe out for 4 seconds, then hold for 4 seconds. Repeat for several rounds.",
      id: "Tarik napas selama 4 detik, tahan selama 4 detik, buang napas selama 4 detik, lalu tahan selama 4 detik. Ulangi selama beberapa putaran.",
    },
  },
  "gratitude journal": {
    title: { en: "Gratitude Journal", id: "Jurnal Rasa Syukur" },
    description: {
      en: "Reflect on a few things that you appreciate or that went well today.",
      id: "Renungkan beberapa hal yang kamu hargai atau yang berjalan dengan baik hari ini.",
    },
    instructions: {
      en: "Take a moment to write down three things you are grateful for today. They can be small or big things.",
      id: "Luangkan waktu sejenak untuk menuliskan tiga hal yang kamu syukuri hari ini. Bisa berupa hal kecil maupun besar.",
    },
  },
  "grounding 5-4-3-2-1": {
    title: { en: "Grounding 5-4-3-2-1", id: "Teknik Grounding 5-4-3-2-1" },
    description: {
      en: "A grounding activity that brings your attention back to the present moment.",
      id: "Aktivitas grounding yang membawa kembali perhatianmu sepenuhnya ke masa kini.",
    },
    instructions: {
      en: "Acknowledge 5 things you see, 4 things you can touch, 3 things you hear, 2 things you can smell, and 1 thing you can taste.",
      id: "Sebutkan 5 hal yang bisa kamu lihat, 4 hal yang bisa kamu sentuh, 3 hal yang bisa kamu dengar, 2 hal yang bisa kamu cium baunya, dan 1 hal yang bisa kamu kecap.",
    },
  },
  "short walk": {
    title: { en: "Short Walk", id: "Jalan Kaki Sejenak" },
    description: {
      en: "Take a short mindful walk and give yourself some space away from your current environment.",
      id: "Luangkan waktu sejenak untuk berjalan santai dan beri ruang bagi dirimu dari penatnya lingkungan saat ini.",
    },
    instructions: {
      en: "Walk slowly for a few minutes. Pay attention to your steps, feel the air around you, and observe your surroundings without judgment.",
      id: "Berjalanlah dengan santai selama beberapa menit. Perhatikan langkah kakimu, rasakan udara di sekitarmu, dan amati lingkungan sekitar tanpa menghakimi.",
    },
  },
  "progressive muscle relaxation": {
    title: { en: "Progressive Muscle Relaxation", id: "Relaksasi Otot Progresif" },
    description: {
      en: "A relaxation exercise involving gentle tensing and releasing of different muscle groups.",
      id: "Latihan relaksasi yang melibatkan ketegangan dan pelepasan lembut pada berbagai kelompok otot secara berurutan.",
    },
    instructions: {
      en: "Tense a muscle group (like your hands) for 5 seconds, then release slowly while exhaling. Move to other muscle groups from your toes to your head.",
      id: "Tegangkan sekelompok otot (seperti tangan) selama 5 detik, lalu lepaskan secara perlahan sambil membuang napas. Pindah ke kelompok otot lain dari ujung kaki hingga kepala.",
    },
  },
};

function getWellbeingTitle(title: string | null | undefined, isId: boolean) {
  if (!title) return "";
  const translation = wellbeingTranslations[title.toLowerCase().trim()];
  return translation ? (isId ? translation.title.id : translation.title.en) : title;
}

function getWellbeingDescription(title: string | null | undefined, originalDesc: string | null | undefined, isId: boolean) {
  if (!title) return originalDesc || "";
  const translation = wellbeingTranslations[title.toLowerCase().trim()];
  return translation ? (isId ? translation.description.id : translation.description.en) : (originalDesc || "");
}

function getWellbeingInstructions(title: string | null | undefined, originalInst: string | null | undefined, isId: boolean) {
  if (!title) return originalInst || "";
  const translation = wellbeingTranslations[title.toLowerCase().trim()];
  return translation ? (isId ? translation.instructions.id : translation.instructions.en) : (originalInst || "");
}

function formatCategory(category: string, isId: boolean) {
  const value = category.toLowerCase();
  if (value.includes("breath")) return isId ? "Pernapasan" : "Breathing";
  if (value.includes("ground")) return "Grounding";
  if (value.includes("movement")) return isId ? "Gerakan" : "Movement";
  if (value.includes("reflection")) return isId ? "Refleksi" : "Reflection";
  if (value.includes("relax")) return isId ? "Relaksasi" : "Relaxation";
  return category;
}

const BREATHING_PHASES: ActivityPhase[] = [
  {
    id: "inhale",
    titleId: "Tarik napas",
    titleEn: "Inhale",
    instructionId:
      "Tarik napas perlahan melalui hidung.",
    instructionEn:
      "Slowly breathe in through your nose.",
    durationSeconds: 4,
    action: "INHALE",
  },
  {
    id: "hold",
    titleId: "Tahan",
    titleEn: "Hold",
    instructionId:
      "Tahan napas dengan lembut. Jangan memaksakan diri.",
    instructionEn:
      "Gently hold your breath. Do not force it.",
    durationSeconds: 4,
    action: "HOLD",
  },
  {
    id: "exhale",
    titleId: "Buang napas",
    titleEn: "Exhale",
    instructionId:
      "Buang napas perlahan melalui mulut.",
    instructionEn:
      "Slowly breathe out through your mouth.",
    durationSeconds: 6,
    action: "EXHALE",
  },
  {
    id: "rest",
    titleId: "Jeda",
    titleEn: "Rest",
    instructionId:
      "Biarkan napas kembali natural sebelum memulai lagi.",
    instructionEn:
      "Let your breathing return naturally before starting again.",
    durationSeconds: 2,
    action: "REST",
  },
];

function formatDifficulty(
  difficulty: Activity["difficulty"],
  isId: boolean,
) {
  const labels = {
    EASY: isId ? "Mudah" : "Easy",
    MODERATE: isId ? "Sedang" : "Moderate",
    ADVANCED: isId ? "Lanjutan" : "Advanced",
  };

  return labels[difficulty];
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));

  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");

  const remaining = (safeSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remaining}`;
}

function isBreathingActivity(activity: Activity) {
  const value = [
    activity.slug,
    activity.title,
    activity.category,
    activity.description,
  ]
    .join(" ")
    .toLowerCase();

  const keywords = [
    "breath",
    "breathing",
    "napas",
    "pernapasan",
    "pernafasan",
    "box breathing",
  ];

  return keywords.some((keyword) =>
    value.includes(keyword),
  );
}

function getGuidedPhases(
  activity: Activity,
): ActivityPhase[] {
  return [
    {
      id: "prepare",
      titleId: "Persiapan",
      titleEn: "Get ready",
      instructionId:
        "Cari posisi yang nyaman dan beri dirimu waktu untuk hadir di sini.",
      instructionEn:
        "Find a comfortable position and give yourself a moment to be here.",
      durationSeconds: 15,
      action: "GUIDE",
    },
    {
      id: "practice",
      titleId: "Lakukan perlahan",
      titleEn: "Take it slowly",
      instructionId:
        "Ikuti instruksi aktivitas dengan ritme yang terasa nyaman.",
      instructionEn:
        "Follow the activity instructions at a pace that feels comfortable.",
      durationSeconds: 0,
      action: "GUIDE",
    },
    {
      id: "notice",
      titleId: "Perhatikan",
      titleEn: "Notice",
      instructionId:
        "Perhatikan apa yang terasa di tubuh dan pikiranmu tanpa perlu menilainya.",
      instructionEn:
        "Notice what you feel in your body and mind without judging it.",
      durationSeconds: 0,
      action: "GUIDE",
    },
    {
      id: "close",
      titleId: "Penutup",
      titleEn: "Close",
      instructionId:
        "Perlahan selesaikan aktivitas dan sadari bagaimana perasaanmu sekarang.",
      instructionEn:
        "Slowly finish the activity and notice how you feel right now.",
      durationSeconds: 15,
      action: "GUIDE",
    },
  ];
}

function prepareGuidedPhases(
  activity: Activity,
): ActivityPhase[] {
  const total = Math.max(
    activity.durationMinutes * 60,
    60,
  );

  const phases = getGuidedPhases(activity);

  const fixedSeconds =
    phases[0].durationSeconds +
    phases[3].durationSeconds;

  const remaining = Math.max(
    total - fixedSeconds,
    30,
  );

  const practiceSeconds = Math.round(
    remaining * 0.6,
  );

  const noticeSeconds = Math.max(
    remaining - practiceSeconds,
    15,
  );

  return [
    {
      ...phases[0],
      durationSeconds: 15,
    },
    {
      ...phases[1],
      durationSeconds: practiceSeconds,
    },
    {
      ...phases[2],
      durationSeconds: noticeSeconds,
    },
    {
      ...phases[3],
      durationSeconds: 15,
    },
  ];
}

function getPhaseIndex(
  elapsedSeconds: number,
  phases: ActivityPhase[],
) {
  let accumulated = 0;

  for (let index = 0; index < phases.length; index += 1) {
    accumulated += phases[index].durationSeconds;

    if (elapsedSeconds < accumulated) {
      return index;
    }
  }

  return Math.max(phases.length - 1, 0);
}

function getPhaseElapsed(
  elapsedSeconds: number,
  phases: ActivityPhase[],
  phaseIndex: number,
) {
  let start = 0;

  for (let index = 0; index < phaseIndex; index += 1) {
    start += phases[index].durationSeconds;
  }

  return Math.max(
    0,
    elapsedSeconds - start,
  );
}

function getBreathingState(
  elapsedSeconds: number,
) {
  const cycleDuration = BREATHING_PHASES.reduce(
    (total, phase) =>
      total + phase.durationSeconds,
    0,
  );

  const cycleNumber =
    Math.floor(elapsedSeconds / cycleDuration) + 1;

  const cycleElapsed =
    elapsedSeconds % cycleDuration;

  let accumulated = 0;

  for (
    let index = 0;
    index < BREATHING_PHASES.length;
    index += 1
  ) {
    const phase = BREATHING_PHASES[index];
    const next = accumulated + phase.durationSeconds;

    if (cycleElapsed < next) {
      return {
        phaseIndex: index,
        phaseElapsed:
          cycleElapsed - accumulated,
        cycleNumber,
        cycleDuration,
      };
    }

    accumulated = next;
  }

  return {
    phaseIndex: BREATHING_PHASES.length - 1,
    phaseElapsed:
      BREATHING_PHASES[BREATHING_PHASES.length - 1]
        .durationSeconds,
    cycleNumber,
    cycleDuration,
  };
}

function getActionLabel(
  action: PhaseAction,
  isId: boolean,
) {
  const labels: Record<
    PhaseAction,
    { id: string; en: string }
  > = {
    INHALE: {
      id: "Tarik napas",
      en: "Inhale",
    },
    HOLD: {
      id: "Tahan",
      en: "Hold",
    },
    EXHALE: {
      id: "Buang napas",
      en: "Exhale",
    },
    REST: {
      id: "Jeda",
      en: "Rest",
    },
    GUIDE: {
      id: "Ikuti perlahan",
      en: "Take it slowly",
    },
  };

  return isId
    ? labels[action].id
    : labels[action].en;
}

function getOrbScale(
  action: PhaseAction,
  phaseElapsed: number,
  duration: number,
) {
  if (
    action !== "INHALE" &&
    action !== "EXHALE"
  ) {
    return action === "HOLD" ? 1.18 : 0.82;
  }

  const progress = Math.min(
    1,
    Math.max(
      0,
      phaseElapsed / Math.max(duration, 1),
    ),
  );

  if (action === "INHALE") {
    return 0.82 + progress * 0.36;
  }

  return 1.18 - progress * 0.36;
}

/* ========================================================= */
/* MAIN COMPONENT                                            */
/* ========================================================= */

export default function ActivityDetailClient({
  locale,
  slug,
}: Props) {
  const isId = locale === "id";

  const [activity, setActivity] =
    useState<Activity | null>(null);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [log, setLog] =
    useState<ActivityLog | null>(null);

  const [started, setStarted] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [remainingSeconds, setRemainingSeconds] =
    useState(0);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const totalSeconds = useMemo(() => {
    return (activity?.durationMinutes ?? 0) * 60;
  }, [activity]);

  const breathingMode = useMemo(() => {
    return activity
      ? isBreathingActivity(activity)
      : false;
  }, [activity]);

  const phases = useMemo(() => {
    if (!activity) return [];

    return breathingMode
      ? BREATHING_PHASES
      : prepareGuidedPhases(activity);
  }, [activity, breathingMode]);

  const overallProgress =
    totalSeconds > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (elapsedSeconds / totalSeconds) * 100,
          ),
        )
      : 0;

  const breathingState = breathingMode
    ? getBreathingState(elapsedSeconds)
    : null;

  const currentPhaseIndex = breathingMode
    ? breathingState?.phaseIndex ?? 0
    : getPhaseIndex(
        elapsedSeconds,
        phases,
      );

  const currentPhase =
    phases[currentPhaseIndex] ?? phases[0];

  const phaseElapsed = breathingMode
    ? breathingState?.phaseElapsed ?? 0
    : getPhaseElapsed(
        elapsedSeconds,
        phases,
        currentPhaseIndex,
      );

  const phaseRemaining = Math.max(
    0,
    (currentPhase?.durationSeconds ?? 0) -
      phaseElapsed,
  );

  const phaseProgress =
    currentPhase?.durationSeconds > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (phaseElapsed /
              currentPhase.durationSeconds) *
              100,
          ),
        )
      : 0;

  const orbScale = breathingMode
    ? getOrbScale(
        currentPhase?.action ?? "REST",
        phaseElapsed,
        currentPhase?.durationSeconds ?? 1,
      )
    : 1;

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/activities",
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error(
            isId
              ? "Gagal memuat aktivitas."
              : "Failed to load activities.",
          );
        }

        const data = await response.json();

        const found = Array.isArray(
          data.activities,
        )
          ? data.activities.find(
              (item: Activity) =>
                item.slug === slug,
            )
          : null;

        if (!found) {
          throw new Error(
            isId
              ? "Aktivitas tidak ditemukan."
              : "Activity not found.",
          );
        }

        if (!cancelled) {
          setActivity(found);
          setRemainingSeconds(
            found.durationMinutes * 60,
          );
          setElapsedSeconds(0);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : isId
                ? "Aktivitas tidak ditemukan."
                : "Activity not found.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, [slug, isId]);

  useEffect(() => {
    if (
      !started ||
      reviewing ||
      completed ||
      remainingSeconds <= 0
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(
          totalSeconds,
          current + 1,
        );

        return next;
      });

      setRemainingSeconds((current) => {
        return Math.max(0, current - 1);
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    started,
    reviewing,
    completed,
    remainingSeconds,
    totalSeconds,
  ]);

  function handleStart() {
    if (!activity || starting) {
      return;
    }

    void startActivity();
  }

  async function startActivity() {
    if (!activity) return;

    try {
      setStarting(true);
      setError("");

      const response = await fetch(
        `/api/activities/${activity.id}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({}),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isId
              ? "Gagal memulai aktivitas."
              : "Failed to start activity."),
        );
      }

      setLog(data.log);
      setStarted(true);
      setReviewing(false);
      setCompleted(false);
      setElapsedSeconds(0);
      setRemainingSeconds(totalSeconds);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isId
            ? "Gagal memulai aktivitas."
            : "Failed to start activity.",
      );
    } finally {
      setStarting(false);
    }
  }

  function handleFinishSession() {
    if (!log) {
      return;
    }

    setStarted(false);
    setReviewing(true);
    setRemainingSeconds(0);
  }

  async function handleSubmitReview() {
    if (
      !activity ||
      !log ||
      submitting
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `/api/activities/${activity.id}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            logId: log.id,
            userRating: rating || null,
            userFeedback:
              feedback.trim() || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isId
              ? "Gagal menyimpan aktivitas."
              : "Failed to save activity."),
        );
      }

      setLog(data.log);
      setReviewing(false);
      setCompleted(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : isId
            ? "Gagal menyimpan aktivitas."
            : "Failed to save activity.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    if (!activity) {
      return;
    }

    setStarted(false);
    setReviewing(false);
    setCompleted(false);
    setLog(null);
    setElapsedSeconds(0);
    setRemainingSeconds(
      activity.durationMinutes * 60,
    );
    setRating(0);
    setFeedback("");
    setError("");
  }

  if (loading) {
    return (
      <main className="min-h-full bg-[#FDFBF7] p-5 sm:p-6 lg:p-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#FBC4AB] border-t-[#E2725B]" />

            <p className="text-sm text-[#7A6D62]">
              {isId
                ? "Menyiapkan aktivitas..."
                : "Preparing your activity..."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="min-h-full bg-[#FDFBF7] p-5 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/${locale}/activities`}
            className="inline-flex items-center gap-2 rounded-full border border-[#E8DED5] bg-white px-4 py-2 text-sm font-medium text-[#6B5C50] shadow-sm transition hover:border-[#FBC4AB] hover:text-[#E2725B]"
          >
            <BackIcon className="h-4 w-4" />

            {isId
              ? "Kembali ke Aktivitas"
              : "Back to Activities"}
          </Link>

          <div className="mt-6 rounded-[24px] border border-[#E8DED5] bg-white p-8 text-center shadow-[0_10px_40px_rgba(74,63,53,0.05)]">
            <p className="text-lg font-semibold text-[#4A3F35]">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-[#FDFBF7] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* BACK */}

        <Link
          href={`/${locale}/activities`}
          className="inline-flex items-center gap-2 rounded-full border border-[#E8DED5] bg-white px-4 py-2 text-sm font-medium text-[#6B5C50] shadow-sm transition hover:border-[#FBC4AB] hover:text-[#E2725B]"
        >
          <BackIcon className="h-4 w-4" />

          {isId
            ? "Kembali ke Aktivitas"
            : "Back to Activities"}
        </Link>

        {/* ERROR */}

        {error && (
          <div className="mt-5 rounded-2xl border border-[#F0B9AC] bg-[#FFF2EE] px-4 py-3 text-sm text-[#9D4D3E]">
            {error}
          </div>
        )}

        {/* =====================================================
            INTRO
        ====================================================== */}

        {!started &&
          !reviewing &&
          !completed && (
            <section className="mt-6 overflow-hidden rounded-[28px] border border-[#E8DED5] bg-white shadow-[0_14px_50px_rgba(74,63,53,0.06)]">
              <div className="relative overflow-hidden bg-[#FBC4AB]/25 p-6 sm:p-8 lg:p-10">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#C1D5C0]/40 blur-2xl" />

                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#E2725B] shadow-sm">
                    <ActivityIcon className="h-6 w-6" />
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#E2725B]/10 px-3 py-1.5 text-xs font-semibold text-[#C85E4A]">
                      {formatCategory(activity.category, isId)}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#74675D]">
                      {activity.durationMinutes}{" "}
                      {isId
                        ? "menit"
                        : "minutes"}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#74675D]">
                      {formatDifficulty(
                        activity.difficulty,
                        isId,
                      )}
                    </span>

                    {breathingMode && (
                      <span className="rounded-full bg-[#C1D5C0]/45 px-3 py-1.5 text-xs font-semibold text-[#566B54]">
                        {isId
                          ? "Pernapasan terpandu"
                          : "Guided breathing"}
                      </span>
                    )}
                  </div>

                  <h1 className="mt-5 max-w-2xl text-2xl font-bold tracking-tight text-[#4A3F35] sm:text-3xl lg:text-4xl">
                    {getWellbeingTitle(activity.title, isId)}
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#75685E] sm:text-base">
                    {getWellbeingDescription(activity.title, activity.description, isId)}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#EEE6DF] p-6 sm:p-8 lg:p-10">
                <h2 className="text-base font-bold text-[#4A3F35]">
                  {isId
                    ? "Cara melakukannya"
                    : "How to do it"}
                </h2>

                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-[#75685E]">
                  {getWellbeingInstructions(activity.title, activity.instructions, isId)}
                </div>

                {breathingMode && (
                  <div className="mt-6 rounded-[22px] border border-[#E8DED5] bg-[#FDFBF7] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A8D82]">
                      {isId
                        ? "Ritme pernapasan"
                        : "Breathing rhythm"}
                    </p>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {BREATHING_PHASES.map(
                        (phase) => (
                          <div
                            key={phase.id}
                            className="rounded-2xl bg-white p-3 text-center"
                          >
                            <p className="text-lg font-bold text-[#4A3F35]">
                              {
                                phase.durationSeconds
                              }
                              s
                            </p>

                            <p className="mt-1 text-[10px] font-medium text-[#85776D]">
                              {isId
                                ? phase.titleId
                                : phase.titleEn}
                            </p>
                          </div>
                        ),
                      )}
                    </div>

                    <p className="mt-4 text-xs leading-6 text-[#81746A]">
                      {isId
                        ? "Ritme akan berjalan otomatis. Ikuti gerakan dan instruksi yang muncul di layar."
                        : "The rhythm runs automatically. Follow the movement and instruction shown on screen."}
                    </p>
                  </div>
                )}

                <div className="mt-7 rounded-2xl bg-[#FDFBF7] p-5">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C1D5C0]/50 text-[#5C6B9C]">
                      <WellbeingIcon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#4A3F35]">
                        {isId
                          ? "Ikuti ritmemu sendiri"
                          : "Go at your own pace"}
                      </p>

                      <p className="mt-1 text-xs leading-6 text-[#81746A]">
                        {isId
                          ? "Kalau terasa tidak nyaman, berhenti atau kembali ke napas natural."
                          : "If anything feels uncomfortable, stop or return to your natural breathing."}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStart}
                  disabled={starting}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E2725B] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(226,114,91,0.2)] transition hover:bg-[#D76550] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {starting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <ArrowRightIcon className="h-4 w-4" />
                  )}

                  {isId
                    ? "Mulai Aktivitas"
                    : "Start Activity"}
                </button>
              </div>
            </section>
          )}

        {/* =====================================================
            GUIDED ACTIVITY
        ====================================================== */}

        {started &&
          !reviewing &&
          !completed && (
            <section className="mt-6 overflow-hidden rounded-[28px] border border-[#E8DED5] bg-white shadow-[0_14px_50px_rgba(74,63,53,0.06)]">
              <div className="p-5 sm:p-8 lg:p-10">
                {/* Header */}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E2725B]">
                      {breathingMode
                        ? isId
                          ? "Pernapasan terpandu"
                          : "Guided breathing"
                        : isId
                          ? "Aktivitas terpandu"
                          : "Guided activity"}
                    </p>

                    <h1 className="mt-2 text-xl font-bold text-[#4A3F35] sm:text-2xl">
                      {getWellbeingTitle(activity.title, isId)}
                    </h1>
                  </div>

                  <div className="rounded-full bg-[#FDFBF7] px-3 py-1.5 text-xs font-semibold text-[#75685E]">
                    {Math.round(
                      overallProgress,
                    )}
                    %
                  </div>
                </div>

                {/* Overall progress */}

                <div className="mt-7">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#75685E]">
                      {isId
                        ? "Progress aktivitas"
                        : "Activity progress"}
                    </span>

                    <span className="font-semibold text-[#4A3F35]">
                      {formatTime(
                        elapsedSeconds,
                      )}{" "}
                      /{" "}
                      {formatTime(
                        totalSeconds,
                      )}
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F1E9E2]">
                    <div
                      className="h-full rounded-full bg-[#E2725B] transition-all duration-700"
                      style={{
                        width: `${overallProgress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Phase tracker */}

                <div className="mt-8 overflow-x-auto pb-1">
                  <div className="flex min-w-130 items-center">
                    {phases.map(
                      (phase, index) => {
                        const active =
                          index ===
                          currentPhaseIndex;

                        const done =
                          index <
                          currentPhaseIndex;

                        return (
                          <div
                            key={phase.id}
                            className="flex flex-1 items-center"
                          >
                            <div className="flex min-w-0 flex-col items-center">
                              <div
                                className={[
                                  "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition",
                                  done
                                    ? "border-[#E2725B] bg-[#E2725B] text-white"
                                    : active
                                      ? "border-[#E2725B] bg-[#FBC4AB]/35 text-[#C85E4A]"
                                      : "border-[#E6DDD5] bg-[#FDFBF7] text-[#A79A90]",
                                ].join(" ")}
                              >
                                {done
                                  ? "✓"
                                  : index + 1}
                              </div>

                              <p
                                className={[
                                  "mt-2 max-w-22.5 truncate text-center text-[10px] font-semibold sm:text-xs",
                                  active
                                    ? "text-[#C85E4A]"
                                    : done
                                      ? "text-[#6E6259]"
                                      : "text-[#A79A90]",
                                ].join(" ")}
                              >
                                {isId
                                  ? phase.titleId
                                  : phase.titleEn}
                              </p>
                            </div>

                            {index <
                              phases.length -
                                1 && (
                              <div
                                className={[
                                  "mx-2 h-px flex-1",
                                  index <
                                  currentPhaseIndex
                                    ? "bg-[#E2725B]"
                                    : "bg-[#E9E0D8]",
                                ].join(" ")}
                              />
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* =========================================
                    BREATHING EXPERIENCE
                ========================================== */}

                {breathingMode ? (
                  <div className="mt-8 rounded-[28px] bg-[#FBC4AB]/18 p-5 sm:p-8">
                    <div className="text-center">
                      {breathingState && (
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C85E4A]">
                          {isId
                            ? `Putaran ${breathingState.cycleNumber}`
                            : `Cycle ${breathingState.cycleNumber}`}
                        </p>
                      )}

                      <h2 className="mt-3 text-2xl font-bold text-[#4A3F35] sm:text-3xl">
                        {isId
                          ? currentPhase?.titleId
                          : currentPhase?.titleEn}
                      </h2>

                      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#75685E]">
                        {isId
                          ? currentPhase?.instructionId
                          : currentPhase?.instructionEn}
                      </p>

                      {/* Breathing orb */}

                      <div className="relative mx-auto mt-9 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
                        <div
                          className="absolute inset-0 rounded-full border border-[#FBC4AB]/50"
                          style={{
                            transform: `scale(${0.94 + orbScale * 0.06})`,
                          }}
                        />

                        <div
                          className="absolute h-48 w-48 rounded-full bg-[#FBC4AB]/35 transition-transform duration-700 ease-in-out sm:h-56 sm:w-56"
                          style={{
                            transform: `scale(${orbScale})`,
                          }}
                        />

                        <div
                          className="relative flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white shadow-[0_15px_45px_rgba(226,114,91,0.14)] transition-transform duration-700 ease-in-out sm:h-40 sm:w-40"
                          style={{
                            transform: `scale(${orbScale})`,
                          }}
                        >
                          <span className="text-4xl font-bold tabular-nums text-[#4A3F35] sm:text-5xl">
                            {Math.max(
                              1,
                              Math.ceil(
                                phaseRemaining,
                              ),
                            )}
                          </span>

                          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#9A8D82]">
                            {isId
                              ? "detik"
                              : "seconds"}
                          </span>
                        </div>
                      </div>

                      {/* Action */}

                      <p className="mt-4 text-sm font-semibold text-[#C85E4A]">
                        {getActionLabel(
                          currentPhase?.action ??
                            "REST",
                          isId,
                        )}
                      </p>

                      {/* Phase progress */}

                      <div className="mx-auto mt-6 max-w-sm">
                        <div className="flex items-center justify-between text-[11px] text-[#8B7D72]">
                          <span>
                            {isId
                              ? "Progress fase"
                              : "Phase progress"}
                          </span>

                          <span>
                            {Math.round(
                              phaseProgress,
                            )}
                            %
                          </span>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-[#5C6B9C] transition-all duration-700"
                            style={{
                              width: `${phaseProgress}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Rhythm */}

                      <div className="mx-auto mt-7 grid max-w-lg grid-cols-4 gap-2">
                        {BREATHING_PHASES.map(
                          (
                            phase,
                            index,
                          ) => {
                            const active =
                              index ===
                              currentPhaseIndex;

                            return (
                              <div
                                key={
                                  phase.id
                                }
                                className={[
                                  "rounded-2xl border px-2 py-3 transition text-center",
                                  active
                                    ? "border-[#E2725B] bg-white shadow-sm"
                                    : "border-transparent bg-white/50",
                                ].join(
                                  " ",
                                )}
                              >
                                <p className="text-base font-bold text-[#4A3F35]">
                                  {
                                    phase.durationSeconds
                                  }
                                  s
                                </p>

                                <p className="mt-1 text-[9px] font-medium text-[#85776D] sm:text-[10px]">
                                  {isId
                                    ? phase.titleId
                                    : phase.titleEn}
                                </p>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* =========================================
                      GENERIC GUIDED EXPERIENCE
                  ========================================== */

                  <div className="mt-8 rounded-[28px] bg-[#FBC4AB]/18 p-6 text-center sm:p-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C85E4A]">
                      {isId
                        ? `Tahap ${currentPhaseIndex + 1} dari ${phases.length}`
                        : `Step ${currentPhaseIndex + 1} of ${phases.length}`}
                    </p>

                    <h2 className="mt-3 text-2xl font-bold text-[#4A3F35]">
                      {isId
                        ? currentPhase?.titleId
                        : currentPhase?.titleEn}
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#75685E]">
                      {isId
                        ? currentPhase?.instructionId
                        : currentPhase?.instructionEn}
                    </p>

                    <div className="mt-8">
                      <p className="text-5xl font-bold tabular-nums tracking-tight text-[#4A3F35]">
                        {formatTime(
                          phaseRemaining,
                        )}
                      </p>

                      <p className="mt-2 text-xs text-[#9A8D82]">
                        {isId
                          ? "waktu tahap ini"
                          : "time for this step"}
                      </p>
                    </div>

                    <div className="mx-auto mt-7 max-w-md">
                      <div className="h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-[#5C6B9C] transition-all duration-700"
                          style={{
                            width: `${phaseProgress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity instructions */}

                <div className="mt-6 rounded-[22px] border border-[#E9E0D8] bg-[#FDFBF7] p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B7D72]">
                    {isId
                      ? "Instruksi aktivitas"
                      : "Activity instructions"}
                  </p>

                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#655950]">
                    {getWellbeingInstructions(activity.title, activity.instructions, isId)}
                  </p>
                </div>

                {/* Reminder */}

                <div className="mt-4 rounded-[22px] border border-[#D9E4D7] bg-[#C1D5C0]/25 p-5">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#5C6B9C]">
                      <WellbeingIcon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[#566B54]">
                        {isId
                          ? "Pengingat kecil"
                          : "A gentle reminder"}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#667460]">
                        {breathingMode
                          ? isId
                            ? "Tidak perlu menarik atau menahan napas lebih lama dari yang terasa nyaman. Kembali ke napas natural jika diperlukan."
                            : "You do not need to breathe or hold your breath longer than feels comfortable. Return to natural breathing if needed."
                          : isId
                            ? "Tidak perlu melakukannya dengan sempurna. Fokus pada proses dan apa yang kamu rasakan."
                            : "You do not need to do it perfectly. Focus on the process and how you feel."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Finish */}

                <button
                  type="button"
                  onClick={handleFinishSession}
                  disabled={!log}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E2725B] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(226,114,91,0.18)] transition hover:bg-[#D76550] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckinIcon className="h-4 w-4" />

                  {isId
                    ? "Saya Sudah Selesai"
                    : "I'm Done"}
                </button>
              </div>
            </section>
          )}

        {/* =====================================================
            REVIEW
        ====================================================== */}

        {reviewing && !completed && (
          <section className="mt-6 rounded-[28px] border border-[#E8DED5] bg-white p-6 shadow-[0_14px_50px_rgba(74,63,53,0.06)] sm:p-10">
            <div className="mx-auto max-w-xl">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C1D5C0]/35 text-[#5C6B9C]">
                  <WellbeingIcon className="h-7 w-7" />
                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#E2725B]">
                  {isId
                    ? "Satu langkah lagi"
                    : "One more step"}
                </p>

                <h1 className="mt-2 text-2xl font-bold text-[#4A3F35]">
                  {isId
                    ? "Bagaimana pengalamanmu?"
                    : "How was the experience?"}
                </h1>

                <p className="mt-2 text-sm leading-6 text-[#7A6D63]">
                  {isId
                    ? "Tidak ada jawaban yang benar. Pilih yang paling mendekati apa yang kamu rasakan."
                    : "There is no right answer. Choose what feels closest to how you feel."}
                </p>
              </div>

              {/* Rating */}

              <div className="mt-9">
                <p className="text-sm font-semibold text-[#4A3F35]">
                  {isId
                    ? "Seberapa membantu aktivitas ini?"
                    : "How helpful was this activity?"}
                </p>

                <div className="mt-3 grid grid-cols-5 gap-2">
                  {[
                    {
                      value: 1,
                      id: "Tidak membantu",
                      en: "Not helpful",
                    },
                    {
                      value: 2,
                      id: "Sedikit",
                      en: "A little",
                    },
                    {
                      value: 3,
                      id: "Lumayan",
                      en: "Somewhat",
                    },
                    {
                      value: 4,
                      id: "Membantu",
                      en: "Helpful",
                    },
                    {
                      value: 5,
                      id: "Sangat membantu",
                      en: "Very helpful",
                    },
                  ].map((item) => {
                    const active =
                      rating === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setRating(
                            item.value,
                          )
                        }
                        className={[
                          "rounded-2xl border px-2 py-3 transition",
                          active
                            ? "border-[#E2725B] bg-[#FBC4AB]/25 text-[#C85E4A]"
                            : "border-[#E8DED5] bg-white text-[#8C7E73] hover:border-[#FBC4AB]",
                        ].join(" ")}
                      >
                        <span className="block text-lg font-bold">
                          {item.value}
                        </span>

                        <span className="mt-1 block text-[9px] leading-3 sm:text-[10px]">
                          {isId
                            ? item.id
                            : item.en}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback */}

              <div className="mt-7">
                <label
                  htmlFor="activity-feedback"
                  className="text-sm font-semibold text-[#4A3F35]"
                >
                  {isId
                    ? "Ada yang ingin kamu ceritakan?"
                    : "Anything you'd like to share?"}
                </label>

                <textarea
                  id="activity-feedback"
                  value={feedback}
                  onChange={(event) =>
                    setFeedback(
                      event.target.value,
                    )
                  }
                  placeholder={
                    isId
                      ? "Opsional — ceritakan sedikit tentang pengalamanmu..."
                      : "Optional — tell us a little about your experience..."
                  }
                  rows={5}
                  maxLength={1000}
                  className="mt-3 w-full resize-none rounded-2xl border border-[#E8DED5] bg-[#FDFBF7] px-4 py-3 text-sm leading-6 text-[#4A3F35] outline-none transition placeholder:text-[#A99B90] focus:border-[#E2725B] focus:ring-2 focus:ring-[#FBC4AB]/40"
                />

                <p className="mt-1 text-right text-xs text-[#A29489]">
                  {feedback.length}/1000
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setReviewing(false);
                    setStarted(true);

                    setRemainingSeconds(
                      Math.max(
                        1,
                        totalSeconds -
                          elapsedSeconds,
                      ),
                    );
                  }}
                  disabled={submitting}
                  className="flex-1 rounded-2xl border border-[#E8DED5] bg-white px-5 py-3.5 text-sm font-semibold text-[#675A50] transition hover:bg-[#FDFBF7] disabled:opacity-50"
                >
                  {isId
                    ? "Kembali"
                    : "Back"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleSubmitReview
                  }
                  disabled={submitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#E2725B] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#D76550] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {isId
                    ? "Simpan & Selesai"
                    : "Save & Finish"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            COMPLETED
        ====================================================== */}

        {completed && (
          <section className="mt-6 overflow-hidden rounded-[28px] border border-[#D9E4D7] bg-white shadow-[0_14px_50px_rgba(74,63,53,0.06)]">
            <div className="bg-[#C1D5C0]/25 px-6 py-10 text-center sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#5C6B9C] shadow-sm">
                <WellbeingIcon className="h-7 w-7" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#657A61]">
                {isId
                  ? "Aktivitas selesai"
                  : "Activity complete"}
              </p>

              <h1 className="mt-2 text-2xl font-bold text-[#4A3F35] sm:text-3xl">
                {isId
                  ? "Kamu sudah meluangkan waktu untuk dirimu."
                  : "You made time for yourself."}
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#74685E]">
                {isId
                  ? "Bagian kecil dari hari ini sudah kamu gunakan untuk merawat dirimu."
                  : "You just gave a small part of your day to taking care of yourself."}
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mx-auto max-w-xl">
                <p className="text-sm font-semibold text-[#4A3F35]">
                  {isId
                    ? "Progress aktivitas"
                    : "Activity progress"}
                </p>

                {breathingMode ? (
                  <div className="mt-4 rounded-[22px] bg-[#FDFBF7] p-5">
                    <div className="grid grid-cols-4 gap-2">
                      {BREATHING_PHASES.map(
                        (phase) => (
                          <div
                            key={phase.id}
                            className="rounded-2xl bg-white p-3 text-center"
                          >
                            <p className="text-lg font-bold text-[#4A3F35]">
                              {
                                phase.durationSeconds
                              }
                              s
                            </p>

                            <p className="mt-1 text-[10px] text-[#85776D]">
                              {isId
                                ? phase.titleId
                                : phase.titleEn}
                            </p>
                          </div>
                        ),
                      )}
                    </div>

                    <p className="mt-4 text-xs leading-6 text-[#81746A]">
                      {isId
                        ? "Satu siklus pernapasan terdiri dari tarik napas, tahan, buang napas, dan jeda."
                        : "One breathing cycle consists of inhale, hold, exhale, and rest."}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {phases.map(
                      (phase, index) => (
                        <div
                          key={phase.id}
                          className="flex items-center gap-3 rounded-2xl bg-[#FDFBF7] px-4 py-3"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C1D5C0] text-[#566B54]">
                            <span className="text-xs font-bold">
                              ✓
                            </span>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#4A3F35]">
                              {isId
                                ? phase.titleId
                                : phase.titleEn}
                            </p>

                            <p className="mt-0.5 text-xs text-[#8B7D72]">
                              {isId
                                ? `Tahap ${index + 1} selesai`
                                : `Step ${index + 1} complete`}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {rating > 0 && (
                  <div className="mt-7 rounded-2xl border border-[#E8DED5] bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A8D82]">
                      {isId
                        ? "Penilaianmu"
                        : "Your rating"}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#4A3F35]">
                        {rating}/5
                      </span>

                      <span className="text-sm text-[#75685E]">
                        {isId
                          ? "untuk aktivitas ini"
                          : "for this activity"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/${locale}/activities`}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#E8DED5] bg-white px-5 py-3.5 text-sm font-semibold text-[#675A50] transition hover:bg-[#FDFBF7]"
                  >
                    {isId
                      ? "Kembali ke Aktivitas"
                      : "Back to Activities"}
                  </Link>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#E2725B] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#D76550]"
                  >
                    {isId
                      ? "Lakukan Lagi"
                      : "Do Again"}

                    <ArrowRightIcon className="h-4 w-4" />
                  </button>

                  <Link
                    href={`/${locale}/insights`}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#C1D5C0] bg-[#C1D5C0]/20 px-5 py-3.5 text-sm font-semibold text-[#566B54] transition hover:bg-[#C1D5C0]/30"
                  >
                    {isId
                      ? "Lihat Insights"
                      : "View Insights"}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}