"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRightIcon,
  BackIcon,
  DiaryIcon,
  InsightIcon,
  SupportIcon,
  UserIcon,
  WellbeingIcon,
} from "@/components/reweave-icons";

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

  const [gender, setGender] = useState<
    "MALE" | "FEMALE" | undefined
  >();

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

  const displayName =
    userName.trim().split(" ")[0] || userName;

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

  const stepLabel =
    locale === "id" ? "Langkah" : "Step";

  const ofLabel = locale === "id" ? "dari" : "of";

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#4A3F35]">
      {/* =====================================================
          DECORATIVE BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-105 w-105 rounded-full bg-[#FBC4AB]/20 blur-3xl" />

        <div className="absolute -bottom-52 -right-40 h-130 w-130 rounded-full bg-[#C1D5C0]/20 blur-3xl" />

        <div className="absolute right-[22%] top-[22%] h-28 w-28 rounded-full border border-[#5C6B9C]/6" />
      </div>

      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="relative z-20 border-b border-[#4A3F35]/6 bg-[#FDFBF7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* BRAND */}

          <div className="flex items-center">
            <Image
              src="/reweave-logo.webp"
              alt="Reweave"
              width={150}
              height={48}
              priority
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* RIGHT */}

          <LanguageSwitcher locale={locale} />
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-5xl flex-col px-5 py-7 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        {/* ===================================================
            PROGRESS HEADER
        ==================================================== */}

        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5C6B9C]">
                {stepLabel} {step} {ofLabel} {TOTAL_STEPS}
              </p>

              <p className="mt-1 text-xs text-[#4A3F35]/35">
                {Math.round(progress)}%
              </p>
            </div>

            {/* DOTS */}

            <div className="hidden items-center gap-1.5 sm:flex">
              {Array.from({ length: TOTAL_STEPS }).map(
                (_, index) => {
                  const itemStep = index + 1;

                  const isActive = itemStep === step;
                  const isComplete = itemStep < step;

                  return (
                    <div
                      key={itemStep}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "w-7 bg-[#E2725B]"
                          : isComplete
                            ? "w-3 bg-[#C1D5C0]"
                            : "w-3 bg-[#4A3F35]/10"
                      }`}
                    />
                  );
                }
              )}
            </div>
          </div>

          {/* PROGRESS */}

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#4A3F35]/6">
            <div
              className="h-full rounded-full bg-[#E2725B] transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* ===================================================
            GREETING
        ==================================================== */}

        <div className="mx-auto mt-10 w-full max-w-3xl">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#E2725B]">
              {locale === "id"
                ? `Halo, ${displayName}.`
                : `Hi, ${displayName}.`}
            </p>

            <h1 className="mt-3 text-[32px] font-semibold leading-[1.1] tracking-[-0.045em] text-[#4A3F35] sm:text-[42px]">
              {t.title ??
                (locale === "id"
                  ? "Mari kenali dirimu."
                  : "Let's get to know you.")}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#4A3F35]/50">
              {t.subtitle ??
                (locale === "id"
                  ? "Beberapa pertanyaan singkat ini membantu Reweave memahami cara yang paling nyaman untuk menemanimu."
                  : "A few short questions help Reweave understand the most comfortable way to support you.")}
            </p>
          </div>
        </div>

        {/* ===================================================
            STEP CONTENT
        ==================================================== */}

        <div className="mx-auto mt-9 w-full max-w-3xl flex-1">
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
                  ? "Pilihan ini opsional dan hanya digunakan untuk membantu personalisasi pengalamanmu."
                  : "This is optional and only used to help personalize your experience.")
              }
              value={gender}
              onChange={setGender}
              maleLabel={
                t.gender?.male ??
                (locale === "id"
                  ? "Laki-laki"
                  : "Male")
              }
              femaleLabel={
                t.gender?.female ??
                (locale === "id"
                  ? "Perempuan"
                  : "Female")
              }
            />
          )}

          {step === 2 && (
            <StepMultiSelect
              icon={<WellbeingIcon className="h-5 w-5" />}
              title={
                t.goals?.title ??
                (locale === "id"
                  ? "Apa yang ingin kamu dapatkan dari Reweave?"
                  : "What would you like to get from Reweave?")
              }
              description={
                t.goals?.description ??
                (locale === "id"
                  ? "Pilih semua yang terasa relevan dengan perjalananmu."
                  : "Choose everything that feels relevant to your journey.")
              }
              options={getGoalOptions(
                locale,
                t.goals?.options
              )}
              values={goals}
              onToggle={(value) =>
                toggleArrayValue(value, setGoals)
              }
            />
          )}

          {step === 3 && (
            <StepSingleSelect
              icon={<WellbeingIcon className="h-5 w-5" />}
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
              icon={<InsightIcon className="h-5 w-5" />}
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
              icon={<DiaryIcon className="h-5 w-5" />}
              title={
                t.journaling?.title ??
                (locale === "id"
                  ? "Bagaimana kamu lebih suka memproses perasaan?"
                  : "How do you prefer to process your feelings?")
              }
              description={
                t.journaling?.description ??
                (locale === "id"
                  ? "Kamu tidak harus memilih satu cara saja."
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
              icon={<SupportIcon className="h-5 w-5" />}
              title={
                t.support?.title ??
                (locale === "id"
                  ? "Dukungan seperti apa yang terasa membantu?"
                  : "What kind of support feels helpful?")
              }
              description={
                t.support?.description ??
                (locale === "id"
                  ? "Ini membantu Reweave menyesuaikan cara memberikan dukungan."
                  : "This helps Reweave adapt how it supports you.")
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
              icon={<SupportIcon className="h-5 w-5" />}
              title={
                t.communication?.title ??
                (locale === "id"
                  ? "Bagaimana Reweave sebaiknya berbicara denganmu?"
                  : "How should Reweave talk to you?")
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

        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mx-auto mt-6 w-full max-w-3xl rounded-2xl border border-[#E2725B]/20 bg-[#E2725B]/[0.07] px-4 py-3.5">
            <p className="text-xs leading-5 text-[#C95F4B]">
              {error}
            </p>
          </div>
        )}

        {/* ===================================================
            NAVIGATION
        ==================================================== */}

        <div className="mx-auto mt-9 flex w-full max-w-3xl items-center justify-between border-t border-[#4A3F35]/[0.07] pt-5">
          {/* BACK */}

          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className="
              group
              inline-flex
              h-11
              items-center
              gap-2
              rounded-xl
              px-3
              text-xs
              font-medium
              text-[#4A3F35]/45
              transition
              hover:bg-[#4A3F35]/4
              hover:text-[#4A3F35]/75
              disabled:pointer-events-none
              disabled:opacity-0
            "
          >
            <BackIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />

            {t.back ??
              (locale === "id"
                ? "Kembali"
                : "Back")}
          </button>

          {/* NEXT */}

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="
              group
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#E2725B]
              px-5
              text-xs
              font-semibold
              text-white
              shadow-[0_8px_24px_rgba(226,114,91,0.16)]
              transition
              hover:bg-[#4A3F35]
              hover:shadow-none
              focus:outline-none
              focus:ring-4
              focus:ring-[#E2725B]/10
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:px-6
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
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

/* ===============================================================
   STEP: GENDER
================================================================ */

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
        icon={<UserIcon className="h-5 w-5" />}
        title={title}
        description={description}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <SelectionCard
          selected={value === "MALE"}
          onClick={() => onChange("MALE")}
          icon={<UserIcon className="h-5 w-5" />}
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
          icon={<UserIcon className="h-5 w-5" />}
          title={femaleLabel}
          description={
            locale === "id"
              ? "Gunakan preferensi ini untuk personalisasi."
              : "Use this preference for personalization."
          }
        />
      </div>

      <p className="mt-4 text-[11px] text-[#4A3F35]/35">
        {locale === "id"
          ? "Pilihan ini opsional."
          : "This selection is optional."}
      </p>
    </div>
  );
}

/* ===============================================================
   STEP: SINGLE SELECT
================================================================ */

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

      <div className="grid gap-2.5">
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

/* ===============================================================
   STEP: MULTI SELECT
================================================================ */

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

      <div className="grid gap-2.5 sm:grid-cols-2">
        {options.map((option) => (
          <SelectionCard
            key={option.value}
            selected={values.includes(option.value)}
            onClick={() => onToggle(option.value)}
            title={option.label}
            description={option.description}
          />
        ))}
      </div>
    </div>
  );
}

/* ===============================================================
   STEP HEADER
================================================================ */

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
    <div className="mb-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FBC4AB]/25 text-[#5C6B9C]">
        {icon}
      </div>

      <h2 className="text-[22px] font-semibold leading-tight tracking-[-0.035em] text-[#4A3F35] sm:text-[25px]">
        {title}
      </h2>

      <p className="mt-2 max-w-xl text-xs leading-6 text-[#4A3F35]/45 sm:text-sm">
        {description}
      </p>
    </div>
  );
}

/* ===============================================================
   SELECTION CARD
================================================================ */

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
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`
        group
        relative
        flex
        w-full
        items-center
        gap-3.5
        rounded-2xl
        border
        px-4
        py-3.5
        text-left
        transition-all
        duration-200
        ${
          selected
            ? "border-[#E2725B]/45 bg-[#FFF8F4] shadow-[0_8px_25px_rgba(226,114,91,0.08)]"
            : "border-[#4A3F35]/8 bg-white hover:border-[#C1D5C0] hover:bg-[#FCFCF9]"
        }
      `}
    >
      {/* ICON */}

      {icon && (
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            transition-colors
            ${
              selected
                ? "bg-[#FBC4AB]/45 text-[#E2725B]"
                : "bg-[#FDFBF7] text-[#4A3F35]/35 group-hover:bg-[#C1D5C0]/25 group-hover:text-[#5C6B9C]"
            }
          `}
        >
          {icon}
        </div>
      )}

      {/* CONTENT */}

      <div className="min-w-0 flex-1">
        <p
          className={`
            text-sm
            font-semibold
            leading-5
            ${
              selected
                ? "text-[#4A3F35]"
                : "text-[#4A3F35]/80"
            }
          `}
        >
          {title}
        </p>

        {description && (
          <p className="mt-1 text-[11px] leading-5 text-[#4A3F35]/40">
            {description}
          </p>
        )}
      </div>

      {/* SELECTION */}

      <div
        className={`
          flex
          h-5
          w-5
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          transition-all
          ${
            selected
              ? "border-[#E2725B] bg-[#E2725B]"
              : "border-[#4A3F35]/15 bg-white group-hover:border-[#5C6B9C]/30"
          }
        `}
      >
        {selected && (
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        )}
      </div>
    </button>
  );
}

/* ===============================================================
   OPTIONS
================================================================ */

function getGoalOptions(
  locale: Locale,
  dictionary?: Record<string, string>
): Option[] {
  const values = [
    "UNDERSTAND_EMOTIONS",
    "MANAGE_STRESS",
    "UNDERSTAND_PATTERNS",
    "JOURNALING_HABIT",
    "DAILY_WELLBEING",
    "EXPRESS_MYSELF",
  ];

  if (dictionary) {
    return values.map((value) => ({
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