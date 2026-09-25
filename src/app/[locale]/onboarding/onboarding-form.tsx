"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Headphones,
  MessageCircle,
  PenLine,
  Target,
  UserRound,
  Wind,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/config";

type Dictionary = {
  common?: Record<string, string>;

  onboarding?: {
    title?: string;
    subtitle?: string;

    step?: string;

    next?: string;
    back?: string;
    finish?: string;
    saving?: string;

    gender?: {
      title?: string;
      description?: string;
      male?: string;
      female?: string;
    };

    goals?: {
      title?: string;
      description?: string;
      options?: Record<string, string>;
    };

    currentFeeling?: {
      title?: string;
      description?: string;
      options?: Record<string, string>;
    };

    contexts?: {
      title?: string;
      description?: string;
      options?: Record<string, string>;
    };

    journaling?: {
      title?: string;
      description?: string;
      options?: Record<string, string>;
    };

    support?: {
      title?: string;
      description?: string;
      options?: Record<string, string>;
    };

    communication?: {
      title?: string;
      description?: string;
      options?: Record<string, string>;
    };
  };
};

type Props = {
  locale: Locale;
  dictionary: Dictionary;
  userName: string;
};

type Option = {
  value: string;
  label: string;
  description?: string;
};

const TOTAL_STEPS = 7;

export default function OnboardingForm({
  locale,
  dictionary,
  userName,
}: Props) {
  const router = useRouter();

  const t = dictionary.onboarding ?? {};

  const [step, setStep] = useState(1);

  const [gender, setGender] = useState<"MALE" | "FEMALE" | undefined>();

  const [goals, setGoals] = useState<string[]>([]);

  const [currentFeeling, setCurrentFeeling] = useState("");

  const [contexts, setContexts] = useState<string[]>([]);

  const [journalingPreference, setJournalingPreference] =
    useState("");

  const [supportPreference, setSupportPreference] =
    useState("");

  const [communicationStyle, setCommunicationStyle] =
    useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  const progress = (step / TOTAL_STEPS) * 100;

  function toggleArrayValue(
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function canContinue() {
    switch (step) {
      case 1:
        return true;

      case 2:
        return goals.length > 0;

      case 3:
        return currentFeeling.length > 0;

      case 4:
        return contexts.length > 0;

      case 5:
        return journalingPreference.length > 0;

      case 6:
        return supportPreference.length > 0;

      case 7:
        return communicationStyle.length > 0;

      default:
        return false;
    }
  }

  function handleNext() {
    setError("");

    if (!canContinue()) {
      setError(
        locale === "id"
          ? "Pilih setidaknya satu pilihan untuk melanjutkan."
          : "Please select at least one option to continue."
      );

      return;
    }

    if (step < TOTAL_STEPS) {
      setStep((current) => current + 1);
      return;
    }

    handleSubmit();
  }

  function handleBack() {
    setError("");

    if (step > 1) {
      setStep((current) => current - 1);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gender,
          goals,
          currentFeeling,
          contexts,
          journalingPreference,
          supportPreference,
          communicationStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            (locale === "id"
              ? "Gagal menyimpan onboarding."
              : "Failed to save onboarding.")
        );

        return;
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch {
      setError(
        locale === "id"
          ? "Terjadi kesalahan. Silakan coba lagi."
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f8fb]">
      {/* =========================================================
          TOP BAR
      ========================================================== */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
              <Heart
                className="h-4.5 w-4.5 text-indigo-600"
                strokeWidth={1.8}
              />
            </div>

            <span className="text-lg font-bold tracking-tight text-gray-900">
              Moodify
            </span>
          </div>

          <LanguageSwitcher locale={locale} />
        </div>
      </header>

      {/* =========================================================
          CONTENT
      ========================================================== */}
      <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl flex-col px-5 py-8 sm:px-8 sm:py-12">
        {/* Progress */}
        <div className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">
              {t.step ?? "Step"} {step} {locale === "id" ? "dari" : "of"}{" "}
              {TOTAL_STEPS}
            </span>

            <span className="text-xs font-semibold text-indigo-600">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Greeting */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-indigo-600">
            {locale === "id"
              ? `Halo, ${userName}`
              : `Hi, ${userName}`}
          </p>

          <h1 className="text-3xl font-bold tracking-[-0.035em] text-gray-900 sm:text-4xl">
            {t.title ??
              (locale === "id"
                ? "Mari kenali dirimu"
                : "Let's get to know you")}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
            {t.subtitle ??
              (locale === "id"
                ? "Jawabanmu membantu Moodify menyesuaikan pengalaman dengan kebutuhanmu."
                : "Your answers help Moodify personalize your experience around your needs.")}
          </p>
        </div>

        {/* =========================================================
            STEP CONTENT
        ========================================================== */}
        <div className="flex-1">
          {step === 1 && (
            <StepGender
              locale={locale}
              title={
                t.gender?.title ??
                (locale === "id"
                  ? "Bagaimana kami bisa mengenalmu?"
                  : "How should we know you?")
              }
              description={
                t.gender?.description ??
                (locale === "id"
                  ? "Pilihan ini opsional dan dapat membantu personalisasi pengalamanmu."
                  : "This is optional and may help personalize your experience.")
              }
              value={gender}
              onChange={setGender}
              maleLabel={
                t.gender?.male ??
                (locale === "id" ? "Laki-laki" : "Male")
              }
              femaleLabel={
                t.gender?.female ??
                (locale === "id" ? "Perempuan" : "Female")
              }
            />
          )}

          {step === 2 && (
            <StepMultiSelect
              icon={<Target className="h-5 w-5" />}
              title={
                t.goals?.title ??
                (locale === "id"
                  ? "Apa yang ingin kamu dapatkan dari Moodify?"
                  : "What would you like to get from Moodify?")
              }
              description={
                t.goals?.description ??
                (locale === "id"
                  ? "Pilih semua yang sesuai dengan kebutuhanmu."
                  : "Choose everything that feels relevant to you.")
              }
              options={getGoalOptions(locale, t.goals?.options)}
              values={goals}
              onToggle={(value) =>
                toggleArrayValue(value, setGoals)
              }
            />
          )}

          {step === 3 && (
            <StepSingleSelect
              icon={<Heart className="h-5 w-5" />}
              title={
                t.currentFeeling?.title ??
                (locale === "id"
                  ? "Bagaimana perasaanmu akhir-akhir ini?"
                  : "How have you been feeling lately?")
              }
              description={
                t.currentFeeling?.description ??
                (locale === "id"
                  ? "Tidak ada jawaban yang benar atau salah."
                  : "There is no right or wrong answer.")
              }
              options={getFeelingOptions(
                locale,
                t.currentFeeling?.options
              )}
              value={currentFeeling}
              onChange={setCurrentFeeling}
            />
          )}

          {step === 4 && (
            <StepMultiSelect
              icon={<Wind className="h-5 w-5" />}
              title={
                t.contexts?.title ??
                (locale === "id"
                  ? "Apa yang biasanya memengaruhi perasaanmu?"
                  : "What tends to affect how you feel?")
              }
              description={
                t.contexts?.description ??
                (locale === "id"
                  ? "Pilih semua yang terasa relevan."
                  : "Choose everything that feels relevant.")
              }
              options={getContextOptions(
                locale,
                t.contexts?.options
              )}
              values={contexts}
              onToggle={(value) =>
                toggleArrayValue(value, setContexts)
              }
            />
          )}

          {step === 5 && (
            <StepSingleSelect
              icon={<PenLine className="h-5 w-5" />}
              title={
                t.journaling?.title ??
                (locale === "id"
                  ? "Bagaimana kamu lebih suka memproses perasaan?"
                  : "How do you prefer to process your feelings?")
              }
              description={
                t.journaling?.description ??
                (locale === "id"
                  ? "Tidak perlu memilih satu cara saja."
                  : "There is no need to stick to only one way.")
              }
              options={getJournalingOptions(
                locale,
                t.journaling?.options
              )}
              value={journalingPreference}
              onChange={setJournalingPreference}
            />
          )}

          {step === 6 && (
            <StepSingleSelect
              icon={<Headphones className="h-5 w-5" />}
              title={
                t.support?.title ??
                (locale === "id"
                  ? "Dukungan seperti apa yang terasa membantu?"
                  : "What kind of support feels helpful?")
              }
              description={
                t.support?.description ??
                (locale === "id"
                  ? "Ini membantu Moodify menyesuaikan cara memberikan dukungan."
                  : "This helps Moodify adapt how it supports you.")
              }
              options={getSupportOptions(
                locale,
                t.support?.options
              )}
              value={supportPreference}
              onChange={setSupportPreference}
            />
          )}

          {step === 7 && (
            <StepSingleSelect
              icon={<MessageCircle className="h-5 w-5" />}
              title={
                t.communication?.title ??
                (locale === "id"
                  ? "Bagaimana Moodify sebaiknya berbicara denganmu?"
                  : "How should Moodify talk to you?")
              }
              description={
                t.communication?.description ??
                (locale === "id"
                  ? "Kamu dapat mengubah preferensi ini kapan saja."
                  : "You can change this preference anytime.")
              }
              options={getCommunicationOptions(
                locale,
                t.communication?.options
              )}
              value={communicationStyle}
              onChange={setCommunicationStyle}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm leading-5 text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* =========================================================
            NAVIGATION
        ========================================================== */}
        <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className="
              inline-flex h-11 items-center gap-2
              rounded-xl px-4
              text-sm font-medium text-gray-500
              transition
              hover:bg-gray-100 hover:text-gray-800
              disabled:pointer-events-none
              disabled:opacity-0
            "
          >
            <ArrowLeft
              className="h-4 w-4"
              strokeWidth={1.8}
            />

            {t.back ??
              (locale === "id" ? "Kembali" : "Back")}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="
              group
              inline-flex h-11
              items-center justify-center gap-2
              rounded-xl
              bg-indigo-600
              px-6
              text-sm font-semibold text-white
              shadow-sm
              transition-all
              hover:bg-indigo-700
              hover:shadow-md
              focus:outline-none
              focus:ring-4
              focus:ring-indigo-500/20
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <span>
              {isSubmitting
                ? t.saving ??
                  (locale === "id"
                    ? "Menyimpan..."
                    : "Saving...")
                : step === TOTAL_STEPS
                  ? t.finish ??
                    (locale === "id"
                      ? "Selesai"
                      : "Finish")
                  : t.next ??
                    (locale === "id"
                      ? "Lanjut"
                      : "Continue")}
            </span>

            {!isSubmitting && (
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   STEP: GENDER
========================================================= */

function StepGender({
  locale,
  title,
  description,
  value,
  onChange,
  maleLabel,
  femaleLabel,
}: {
  locale: Locale;
  title: string;
  description: string;
  value: "MALE" | "FEMALE" | undefined;
  onChange: (value: "MALE" | "FEMALE") => void;
  maleLabel: string;
  femaleLabel: string;
}) {
  return (
    <div>
      <StepHeader
        icon={<UserRound className="h-5 w-5" />}
        title={title}
        description={description}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectionCard
          selected={value === "MALE"}
          onClick={() => onChange("MALE")}
          icon={<UserRound className="h-5 w-5" />}
          title={maleLabel}
          description={
            locale === "id"
              ? "Gunakan preferensi ini untuk personalisasi."
              : "Use this preference for personalization."
          }
        />

        <SelectionCard
          selected={value === "FEMALE"}
          onClick={() => onChange("FEMALE")}
          icon={<UserRound className="h-5 w-5" />}
          title={femaleLabel}
          description={
            locale === "id"
              ? "Gunakan preferensi ini untuk personalisasi."
              : "Use this preference for personalization."
          }
        />
      </div>

      <p className="mt-5 text-xs text-gray-400">
        {locale === "id"
          ? "Pilihan ini opsional."
          : "This selection is optional."}
      </p>
    </div>
  );
}

/* =========================================================
   STEP: SINGLE SELECT
========================================================= */

function StepSingleSelect({
  icon,
  title,
  description,
  options,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <StepHeader
        icon={icon}
        title={title}
        description={description}
      />

      <div className="grid gap-3">
        {options.map((option) => (
          <SelectionCard
            key={option.value}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
            title={option.label}
            description={option.description}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   STEP: MULTI SELECT
========================================================= */

function StepMultiSelect({
  icon,
  title,
  description,
  options,
  values,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  options: Option[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <StepHeader
        icon={icon}
        title={title}
        description={description}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <SelectionCard
            key={option.value}
            selected={values.includes(option.value)}
            onClick={() => onToggle(option.value)}
            title={option.label}
            description={option.description}
            multi
          />
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   STEP HEADER
========================================================= */

function StepHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <h2 className="text-2xl font-bold tracking-[-0.025em] text-gray-900">
        {title}
      </h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   SELECTION CARD
========================================================= */

function SelectionCard({
  selected,
  onClick,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative flex w-full items-start gap-4
        rounded-2xl border p-4
        text-left
        transition-all duration-200
        ${
          selected
            ? "border-indigo-500 bg-indigo-50/70 shadow-sm"
            : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-gray-50"
        }
      `}
    >
      {/* Icon */}
      {icon && (
        <div
          className={`
            flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
            transition-colors
            ${
              selected
                ? "bg-indigo-100 text-indigo-600"
                : "bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
            }
          `}
        >
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`
            text-sm font-semibold
            ${selected ? "text-indigo-900" : "text-gray-900"}
          `}
        >
          {title}
        </p>

        {description && (
          <p className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </p>
        )}
      </div>

      {/* Indicator */}
      <div
        className={`
          mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border
          transition-all
          ${
            selected
              ? "border-indigo-600 bg-indigo-600"
              : "border-gray-300 bg-white"
          }
        `}
      >
        {selected && (
          <Check
            className="h-3 w-3 text-white"
            strokeWidth={2.5}
          />
        )}
      </div>
    </button>
  );
}

/* =========================================================
   OPTIONS
========================================================= */

function getGoalOptions(
  locale: Locale,
  dictionary?: Record<string, string>
): Option[] {
  if (dictionary) {
    return [
      "UNDERSTAND_EMOTIONS",
      "MANAGE_STRESS",
      "UNDERSTAND_PATTERNS",
      "JOURNALING_HABIT",
      "DAILY_WELLBEING",
      "EXPRESS_MYSELF",
    ].map((value) => ({
      value,
      label:
        dictionary[value] ??
        value.replaceAll("_", " "),
    }));
  }

  if (locale === "id") {
    return [
      {
        value: "UNDERSTAND_EMOTIONS",
        label: "Memahami emosiku",
      },
      {
        value: "MANAGE_STRESS",
        label: "Mengelola stres",
      },
      {
        value: "UNDERSTAND_PATTERNS",
        label: "Memahami pola emosiku",
      },
      {
        value: "JOURNALING_HABIT",
        label: "Membangun kebiasaan journaling",
      },
      {
        value: "DAILY_WELLBEING",
        label: "Meningkatkan wellbeing sehari-hari",
      },
      {
        value: "EXPRESS_MYSELF",
        label: "Memiliki ruang untuk mengekspresikan diri",
      },
    ];
  }

  return [
    {
      value: "UNDERSTAND_EMOTIONS",
      label: "Understand my emotions",
    },
    {
      value: "MANAGE_STRESS",
      label: "Manage stress",
    },
    {
      value: "UNDERSTAND_PATTERNS",
      label: "Understand my emotional patterns",
    },
    {
      value: "JOURNALING_HABIT",
      label: "Build a journaling habit",
    },
    {
      value: "DAILY_WELLBEING",
      label: "Improve my daily wellbeing",
    },
    {
      value: "EXPRESS_MYSELF",
      label: "Have a space to express myself",
    },
  ];
}

function getFeelingOptions(
  locale: Locale,
  dictionary?: Record<string, string>
): Option[] {
  const values = [
    "MOSTLY_GOOD",
    "PRETTY_OKAY",
    "UP_AND_DOWN",
    "MOSTLY_DIFFICULT",
    "REALLY_OVERWHELMED",
    "NOT_SURE",
  ];

  if (dictionary) {
    return values.map((value) => ({
      value,
      label: dictionary[value] ?? value,
    }));
  }

  if (locale === "id") {
    return [
      {
        value: "MOSTLY_GOOD",
        label: "Sebagian besar baik",
      },
      {
        value: "PRETTY_OKAY",
        label: "Cukup baik",
      },
      {
        value: "UP_AND_DOWN",
        label: "Naik turun",
      },
      {
        value: "MOSTLY_DIFFICULT",
        label: "Sebagian besar terasa sulit",
      },
      {
        value: "REALLY_OVERWHELMED",
        label: "Benar-benar kewalahan",
      },
      {
        value: "NOT_SURE",
        label: "Aku tidak yakin",
      },
    ];
  }

  return [
    {
      value: "MOSTLY_GOOD",
      label: "Mostly good",
    },
    {
      value: "PRETTY_OKAY",
      label: "Pretty okay",
    },
    {
      value: "UP_AND_DOWN",
      label: "Up and down",
    },
    {
      value: "MOSTLY_DIFFICULT",
      label: "Mostly difficult",
    },
    {
      value: "REALLY_OVERWHELMED",
      label: "Really overwhelmed",
    },
    {
      value: "NOT_SURE",
      label: "I'm not sure",
    },
  ];
}

function getContextOptions(
  locale: Locale,
  dictionary?: Record<string, string>
): Option[] {
  const values = [
    "SCHOOL_WORK",
    "FAMILY",
    "RELATIONSHIP",
    "FINANCIAL",
    "SLEEP",
    "PHYSICAL_HEALTH",
    "SOCIAL",
    "LIFE_CHANGES",
  ];

  if (dictionary) {
    return values.map((value) => ({
      value,
      label: dictionary[value] ?? value,
    }));
  }

  if (locale === "id") {
    return [
      {
        value: "SCHOOL_WORK",
        label: "Sekolah / Pekerjaan",
      },
      {
        value: "FAMILY",
        label: "Keluarga",
      },
      {
        value: "RELATIONSHIP",
        label: "Hubungan",
      },
      {
        value: "FINANCIAL",
        label: "Keuangan",
      },
      {
        value: "SLEEP",
        label: "Tidur",
      },
      {
        value: "PHYSICAL_HEALTH",
        label: "Kesehatan fisik",
      },
      {
        value: "SOCIAL",
        label: "Sosial",
      },
      {
        value: "LIFE_CHANGES",
        label: "Perubahan hidup",
      },
    ];
  }

  return [
    {
      value: "SCHOOL_WORK",
      label: "School / Work",
    },
    {
      value: "FAMILY",
      label: "Family",
    },
    {
      value: "RELATIONSHIP",
      label: "Relationship",
    },
    {
      value: "FINANCIAL",
      label: "Financial",
    },
    {
      value: "SLEEP",
      label: "Sleep",
    },
    {
      value: "PHYSICAL_HEALTH",
      label: "Physical health",
    },
    {
      value: "SOCIAL",
      label: "Social",
    },
    {
      value: "LIFE_CHANGES",
      label: "Life changes",
    },
  ];
}

function getJournalingOptions(
  locale: Locale,
  dictionary?: Record<string, string>
): Option[] {
  const values = [
    "WRITING",
    "TALKING",
    "TRACKING",
    "CALMING_ACTIVITIES",
    "EVERYTHING",
  ];

  if (dictionary) {
    return values.map((value) => ({
      value,
      label: dictionary[value] ?? value,
    }));
  }

  if (locale === "id") {
    return [
      {
        value: "WRITING",
        label: "Menulis",
      },
      {
        value: "TALKING",
        label: "Berbicara",
      },
      {
        value: "TRACKING",
        label: "Melacak pola",
      },
      {
        value: "CALMING_ACTIVITIES",
        label: "Aktivitas menenangkan",
      },
      {
        value: "EVERYTHING",
        label: "Sedikit dari semuanya",
      },
    ];
  }

  return [
    {
      value: "WRITING",
      label: "Writing",
    },
    {
      value: "TALKING",
      label: "Talking",
    },
    {
      value: "TRACKING",
      label: "Tracking patterns",
    },
    {
      value: "CALMING_ACTIVITIES",
      label: "Calming activities",
    },
    {
      value: "EVERYTHING",
      label: "A little bit of everything",
    },
  ];
}

function getSupportOptions(
  locale: Locale,
  dictionary?: Record<string, string>
): Option[] {
  const values = [
    "LISTEN",
    "UNDERSTAND",
    "CALM_ACTIVITY",
    "REFLECTION",
    "PRACTICAL_STEPS",
    "SPACE",
  ];

  if (dictionary) {
    return values.map((value) => ({
      value,
      label: dictionary[value] ?? value,
    }));
  }

  if (locale === "id") {
    return [
      {
        value: "LISTEN",
        label: "Seseorang untuk mendengarkan",
      },
      {
        value: "UNDERSTAND",
        label: "Membantu memahami perasaanku",
      },
      {
        value: "CALM_ACTIVITY",
        label: "Memberikan aktivitas yang menenangkan",
      },
      {
        value: "REFLECTION",
        label: "Membantu berefleksi",
      },
      {
        value: "PRACTICAL_STEPS",
        label: "Memberikan langkah praktis",
      },
      {
        value: "SPACE",
        label: "Memberiku ruang",
      },
    ];
  }

  return [
    {
      value: "LISTEN",
      label: "Someone to listen",
    },
    {
      value: "UNDERSTAND",
      label: "Help me understand what I'm feeling",
    },
    {
      value: "CALM_ACTIVITY",
      label: "Give me something calming to do",
    },
    {
      value: "REFLECTION",
      label: "Help me reflect",
    },
    {
      value: "PRACTICAL_STEPS",
      label: "Give me practical steps",
    },
    {
      value: "SPACE",
      label: "Just give me some space",
    },
  ];
}

function getCommunicationOptions(
  locale: Locale,
  dictionary?: Record<string, string>
): Option[] {
  const values = [
    "GENTLE",
    "PRACTICAL",
    "BALANCED",
  ];

  if (dictionary) {
    return values.map((value) => ({
      value,
      label: dictionary[value] ?? value,
    }));
  }

  if (locale === "id") {
    return [
      {
        value: "GENTLE",
        label: "Lembut & empatik",
        description:
          "Gunakan pendekatan yang hangat dan penuh empati.",
      },
      {
        value: "PRACTICAL",
        label: "Praktis & langsung",
        description:
          "Berikan saran yang jelas dan langsung ke inti.",
      },
      {
        value: "BALANCED",
        label: "Seimbang",
        description:
          "Gabungkan empati dengan langkah-langkah praktis.",
      },
    ];
  }

  return [
    {
      value: "GENTLE",
      label: "Gentle & empathetic",
      description:
        "Use a warm and empathetic approach.",
    },
    {
      value: "PRACTICAL",
      label: "Practical & direct",
      description:
        "Give clear and straightforward guidance.",
    },
    {
      value: "BALANCED",
      label: "Balanced",
      description:
        "Combine empathy with practical guidance.",
    },
  ];
}