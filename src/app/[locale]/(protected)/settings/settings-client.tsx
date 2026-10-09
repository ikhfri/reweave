"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  BellIcon,
  DiaryIcon,
  GlobeIcon,
  SaveIcon,
  SupportIcon,
  UserIcon,
} from "@/components/reweave-icons";

import type { Locale } from "@/i18n/config";

type SettingsData = {
  name: string;
  nickname: string | null;
  email: string;

  preference: {
    language: "ID" | "EN";

    communicationStyle:
      | "GENTLE"
      | "PRACTICAL"
      | "BALANCED";

    supportPreference:
      | "LISTEN"
      | "UNDERSTAND"
      | "CALM_ACTIVITY"
      | "REFLECTION"
      | "PRACTICAL_STEPS"
      | "SPACE";

    journalingPreference:
      | "WRITING"
      | "TALKING"
      | "TRACKING"
      | "CALMING_ACTIVITIES"
      | "EVERYTHING";

    notificationEnabled: boolean;

    dailyCheckinTime: string | null;
  };
};

type Props = {
  locale: Locale;
  userName: string;
};

type ReweaveSelectOption = {
  value: string;
  label: string;
  description?: string;
};

type ReweaveSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: ReweaveSelectOption[];
  placeholder?: string;
  disabled?: boolean;
};

export default function SettingsClient({
  locale,
  userName,
}: Props) {
  const router = useRouter();

  const isEnglish = locale === "en";

  const [settings, setSettings] =
    useState<SettingsData | null>(null);

  const [name, setName] = useState(userName);
  const [nickname, setNickname] = useState("");

  const [language, setLanguage] = useState<
    "ID" | "EN"
  >(locale === "en" ? "EN" : "ID");

  const [communicationStyle, setCommunicationStyle] =
    useState("BALANCED");

  const [supportPreference, setSupportPreference] =
    useState("UNDERSTAND");

  const [journalingPreference, setJournalingPreference] =
    useState("WRITING");

  const [notifications, setNotifications] =
    useState(true);

  const [dailyCheckinTime, setDailyCheckinTime] =
    useState("08:00");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  /*
   * =========================================================
   * LOAD SETTINGS
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        setLoading(true);

        const response = await fetch("/api/settings", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ??
              (isEnglish
                ? "Failed to load settings."
                : "Gagal mengambil pengaturan.")
          );
        }

        if (cancelled) {
          return;
        }

        const data: SettingsData = result.settings;

        setSettings(data);

        setName(data.name);
        setNickname(data.nickname ?? "");

        setLanguage(data.preference.language);

        setCommunicationStyle(
          data.preference.communicationStyle
        );

        setSupportPreference(
          data.preference.supportPreference
        );

        setJournalingPreference(
          data.preference.journalingPreference
        );

        setNotifications(
          data.preference.notificationEnabled
        );

        setDailyCheckinTime(
          data.preference.dailyCheckinTime ??
            "08:00"
        );
      } catch (error) {
        console.error(
          "Settings load error:",
          error
        );

        setMessage(
          error instanceof Error
            ? error.message
            : isEnglish
              ? "Failed to load settings."
              : "Gagal mengambil pengaturan."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [isEnglish]);

  /*
   * =========================================================
   * SAVE SETTINGS
   * =========================================================
   */

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");

      const response = await fetch("/api/settings", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),
          nickname: nickname.trim() || null,

          language,

          communicationStyle,

          supportPreference,

          journalingPreference,

          notificationEnabled: notifications,

          dailyCheckinTime: notifications
            ? dailyCheckinTime
            : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ??
            (isEnglish
              ? "Failed to save preferences."
              : "Gagal menyimpan pengaturan.")
        );
      }

      setSettings(result.settings);

      const nextLocale: Locale =
        language === "EN" ? "en" : "id";

      if (nextLocale !== locale) {
        router.replace(
          `/${nextLocale}/settings`
        );

        return;
      }

      router.refresh();

      setMessage(
        isEnglish
          ? "Preferences saved successfully."
          : "Preferensi berhasil disimpan."
      );
    } catch (error) {
      console.error(
        "Settings save error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : isEnglish
            ? "Failed to save preferences."
            : "Gagal menyimpan preferensi."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#C1D5C0]/45" />

        <div className="h-40 animate-pulse rounded-2xl bg-[#FDFBF7]" />

        <div className="h-56 animate-pulse rounded-2xl bg-[#FDFBF7]" />

        <div className="h-56 animate-pulse rounded-2xl bg-[#FDFBF7]" />
      </div>
    );
  }

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <div className="mx-auto max-w-4xl space-y-7 text-[#4A3F35]">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <section>
        <p className="text-sm font-medium text-[#5C6B9C]">
          {isEnglish
            ? "Settings"
            : "Pengaturan"}
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-[#4A3F35]">
          {isEnglish
            ? "Your preferences"
            : "Preferensi kamu"}
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#4A3F35]/55">
          {isEnglish
            ? "Personalize how Reweave works for you."
            : "Personalisasikan bagaimana Reweave bekerja untukmu."}
        </p>
      </section>

      {/* =====================================================
          PROFILE
      ====================================================== */}

      <SettingsSection
        icon={<UserIcon className="h-5 w-5" />}
        title={isEnglish ? "Profile" : "Profil"}
        description={
          isEnglish
            ? "Basic account information."
            : "Informasi dasar akun."
        }
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="settings-name"
              className="mb-2 block text-xs font-medium text-[#4A3F35]/80"
            >
              {isEnglish ? "Name" : "Nama"}
            </label>

            <input
              id="settings-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              disabled={saving}
              className="
                h-11
                w-full
                rounded-xl
                border
                border-[#4A3F35]/10
                bg-white
                px-3
                text-sm
                text-[#4A3F35]
                outline-none
                transition
                placeholder:text-[#4A3F35]/30
                hover:border-[#C1D5C0]
                focus:border-[#E2725B]
                focus:ring-4
                focus:ring-[#FBC4AB]/30
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />
          </div>

          <div>
            <label
              htmlFor="settings-nickname"
              className="mb-2 block text-xs font-medium text-[#4A3F35]/80"
            >
              {isEnglish ? "Nickname" : "Nama panggilan"}
            </label>

            <input
              id="settings-nickname"
              value={nickname}
              onChange={(event) =>
                setNickname(event.target.value)
              }
              disabled={saving}
              maxLength={50}
              placeholder={
                isEnglish
                  ? "What should Reweave call you?"
                  : "Reweave sebaiknya memanggilmu apa?"
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-[#4A3F35]/10
                bg-white
                px-3
                text-sm
                text-[#4A3F35]
                outline-none
                transition
                placeholder:text-[#4A3F35]/30
                hover:border-[#C1D5C0]
                focus:border-[#E2725B]
                focus:ring-4
                focus:ring-[#FBC4AB]/30
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />

            <p className="mt-1.5 text-[11px] leading-4 text-[#4A3F35]/40">
              {isEnglish
                ? "Optional. This can be different from your full name."
                : "Opsional. Bisa berbeda dari nama lengkapmu."}
            </p>
          </div>

          <div>
            <label
              htmlFor="settings-email"
              className="mb-2 block text-xs font-medium text-[#4A3F35]/80"
            >
              Email
            </label>

            <input
              id="settings-email"
              value={settings?.email ?? ""}
              disabled
              className="
                h-11
                w-full
                rounded-xl
                border
                border-[#4A3F35]/10
                bg-[#C1D5C0]/15
                px-3
                text-sm
                text-[#4A3F35]/45
                outline-none
              "
            />
          </div>
        </div>
      </SettingsSection>

      {/* =====================================================
          LANGUAGE
      ====================================================== */}

      <SettingsSection
        icon={<GlobeIcon className="h-5 w-5" />}
        title={isEnglish ? "Language" : "Bahasa"}
        description={
          isEnglish
            ? "Choose your preferred language."
            : "Pilih bahasa yang kamu gunakan."
        }
      >
        <ReweaveSelect
          value={language}
          onChange={(value) =>
            setLanguage(value as "ID" | "EN")
          }
          disabled={saving}
          options={[
            {
              value: "ID",
              label: "Bahasa Indonesia",
              description: isEnglish
                ? "Use Reweave in Bahasa Indonesia."
                : "Gunakan Reweave dalam Bahasa Indonesia.",
            },
            {
              value: "EN",
              label: "English",
              description: isEnglish
                ? "Use Reweave in English."
                : "Gunakan Reweave dalam Bahasa Inggris.",
            },
          ]}
        />
      </SettingsSection>

      {/* =====================================================
          COMMUNICATION
      ====================================================== */}

      <SettingsSection
        title={
          isEnglish
            ? "Communication style"
            : "Gaya komunikasi"
        }
        description={
          isEnglish
            ? "How would you like Reweave to communicate with you?"
            : "Bagaimana kamu ingin Reweave berkomunikasi denganmu?"
        }
      >
        <ReweaveSelect
          value={communicationStyle}
          onChange={setCommunicationStyle}
          disabled={saving}
          options={[
            {
              value: "GENTLE",
              label: isEnglish
                ? "Gentle"
                : "Lembut",
              description: isEnglish
                ? "Warm, empathetic, and reassuring."
                : "Hangat, empatik, dan menenangkan.",
            },
            {
              value: "PRACTICAL",
              label: isEnglish
                ? "Practical"
                : "Praktis",
              description: isEnglish
                ? "Clear and straightforward guidance."
                : "Panduan yang jelas dan langsung.",
            },
            {
              value: "BALANCED",
              label: isEnglish
                ? "Balanced"
                : "Seimbang",
              description: isEnglish
                ? "A balance between empathy and practical guidance."
                : "Gabungan empati dan langkah praktis.",
            },
          ]}
        />
      </SettingsSection>

      {/* =====================================================
          SUPPORT
      ====================================================== */}

      <SettingsSection
        icon={
          <SupportIcon className="h-5 w-5" />
        }
        title={
          isEnglish
            ? "Support preference"
            : "Preferensi dukungan"
        }
        description={
          isEnglish
            ? "What kind of support feels useful to you?"
            : "Dukungan seperti apa yang terasa berguna untukmu?"
        }
      >
        <ReweaveSelect
          value={supportPreference}
          onChange={setSupportPreference}
          disabled={saving}
          options={[
            {
              value: "LISTEN",
              label: isEnglish
                ? "Just listen"
                : "Cukup didengarkan",
              description: isEnglish
                ? "Give me space to express what I'm feeling."
                : "Berikan ruang untukku menceritakan perasaanku.",
            },
            {
              value: "UNDERSTAND",
              label: isEnglish
                ? "Help me understand"
                : "Bantu saya memahami",
              description: isEnglish
                ? "Help me make sense of what I'm feeling."
                : "Bantu aku memahami apa yang sedang kurasakan.",
            },
            {
              value: "CALM_ACTIVITY",
              label: isEnglish
                ? "Calming activities"
                : "Aktivitas menenangkan",
              description: isEnglish
                ? "Suggest something calming that I can do."
                : "Berikan aktivitas yang bisa membantu menenangkan diri.",
            },
            {
              value: "REFLECTION",
              label: isEnglish
                ? "Reflection"
                : "Refleksi",
              description: isEnglish
                ? "Help me reflect on my thoughts and feelings."
                : "Bantu aku merefleksikan pikiran dan perasaanku.",
            },
            {
              value: "PRACTICAL_STEPS",
              label: isEnglish
                ? "Practical steps"
                : "Langkah praktis",
              description: isEnglish
                ? "Give me clear things I can do."
                : "Berikan langkah yang jelas dan bisa dilakukan.",
            },
            {
              value: "SPACE",
              label: isEnglish
                ? "Give me space"
                : "Berikan saya ruang",
              description: isEnglish
                ? "Keep things simple and give me some room."
                : "Buat semuanya sederhana dan berikan aku ruang.",
            },
          ]}
        />
      </SettingsSection>

      {/* =====================================================
          JOURNALING
      ====================================================== */}

      <SettingsSection
        icon={
          <DiaryIcon className="h-5 w-5" />
        }
        title={
          isEnglish
            ? "Journaling preference"
            : "Preferensi journaling"
        }
        description={
          isEnglish
            ? "How do you prefer to reflect?"
            : "Bagaimana kamu lebih suka melakukan refleksi?"
        }
      >
        <ReweaveSelect
          value={journalingPreference}
          onChange={setJournalingPreference}
          disabled={saving}
          options={[
            {
              value: "WRITING",
              label: isEnglish
                ? "Writing"
                : "Menulis",
              description: isEnglish
                ? "Express yourself through written reflections."
                : "Mengekspresikan diri melalui tulisan.",
            },
            {
              value: "TALKING",
              label: isEnglish
                ? "Talking"
                : "Berbicara",
              description: isEnglish
                ? "Process your thoughts by talking them through."
                : "Memproses pikiran dengan membicarakannya.",
            },
            {
              value: "TRACKING",
              label: isEnglish
                ? "Tracking patterns"
                : "Melacak pola",
              description: isEnglish
                ? "Keep track of moods and emotional patterns."
                : "Melihat pola mood dan emosi dari waktu ke waktu.",
            },
            {
              value: "CALMING_ACTIVITIES",
              label: isEnglish
                ? "Calming activities"
                : "Aktivitas menenangkan",
              description: isEnglish
                ? "Use activities to slow down and reset."
                : "Menggunakan aktivitas untuk menenangkan diri.",
            },
            {
              value: "EVERYTHING",
              label: isEnglish
                ? "A little bit of everything"
                : "Sedikit dari semuanya",
              description: isEnglish
                ? "I like having different ways to reflect."
                : "Aku suka menggunakan berbagai cara untuk berefleksi.",
            },
          ]}
        />
      </SettingsSection>

      {/* =====================================================
          NOTIFICATIONS
      ====================================================== */}

      <SettingsSection
        icon={<BellIcon className="h-5 w-5" />}
        title={
          isEnglish
            ? "Daily reminders"
            : "Pengingat harian"
        }
        description={
          isEnglish
            ? "Choose whether Reweave should remind you to check in."
            : "Atur apakah Reweave boleh mengingatkanmu untuk check-in."
        }
      >
        <div className="space-y-5">
          {/* TOGGLE */}

          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="text-sm font-medium text-[#4A3F35]">
                {isEnglish
                  ? "Enable reminders"
                  : "Aktifkan pengingat"}
              </p>

              <p className="mt-1 text-xs leading-5 text-[#4A3F35]/45">
                {isEnglish
                  ? "Daily check-in reminder"
                  : "Pengingat check-in harian"}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={notifications}
              onClick={() =>
                setNotifications(
                  (current) => !current
                )
              }
              disabled={saving}
              className={`
                relative
                h-7
                w-12
                shrink-0
                rounded-full
                transition
                focus:outline-none
                focus:ring-4
                focus:ring-[#FBC4AB]/35
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${
                  notifications
                    ? "bg-[#E2725B]"
                    : "bg-[#C1D5C0]/70"
                }
              `}
            >
              <span
                className={`
                  absolute
                  top-1
                  h-5
                  w-5
                  rounded-full
                  bg-white
                  shadow-sm
                  transition-all
                  ${
                    notifications
                      ? "left-6"
                      : "left-1"
                  }
                `}
              />
            </button>
          </div>

          {/* TIME */}

          {notifications && (
            <div>
              <label
                htmlFor="daily-checkin-time"
                className="mb-2 block text-xs font-medium text-[#4A3F35]/80"
              >
                {isEnglish
                  ? "Reminder time"
                  : "Waktu pengingat"}
              </label>

              <ReweaveTimePicker
                value={dailyCheckinTime}
                onChange={setDailyCheckinTime}
                disabled={saving}
                isEnglish={isEnglish}
              />
            </div>
          )}
        </div>
      </SettingsSection>

      {/* =====================================================
          SAVE
      ====================================================== */}

      <div className="flex flex-col gap-3 border-t border-[#4A3F35]/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-end">
        {message && (
          <p
            role="status"
            className={`
              text-xs
              font-medium
              ${
                message
                  .toLowerCase()
                  .includes("gagal") ||
                message
                  .toLowerCase()
                  .includes("failed")
                  ? "text-[#C95F4B]"
                  : "text-[#5C6B9C]"
              }
            `}
          >
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#E2725B]
            px-5
            text-sm
            font-semibold
            text-white
            shadow-[0_8px_20px_rgba(226,114,91,0.14)]
            transition
            hover:bg-[#C95F4B]
            hover:shadow-none
            focus:outline-none
            focus:ring-4
            focus:ring-[#FBC4AB]/35
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <SaveIcon className="h-4 w-4" />

          {saving
            ? isEnglish
              ? "Saving..."
              : "Menyimpan..."
            : isEnglish
              ? "Save changes"
              : "Simpan perubahan"}
        </button>
      </div>
    </div>
  );
}

/* ===============================================================
   SETTINGS SECTION
================================================================ */

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-visible rounded-2xl border border-[#4A3F35]/[0.08] bg-white shadow-[0_4px_18px_rgba(74,63,53,0.025)]">
      <div className="border-b border-[#4A3F35]/[0.06] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBC4AB]/35 text-[#5C6B9C]">
              {icon}
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-[#4A3F35]">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#4A3F35]/45">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

/* ===============================================================
   MOODIFY TIME PICKER
================================================================ */

function ReweaveTimePicker({
  value,
  onChange,
  disabled = false,
  isEnglish = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isEnglish?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hourValue, minuteValue] = value.split(":");

  const parsedHour = Number(hourValue);
  const parsedMinute = Number(minuteValue);

  const hour =
    Number.isInteger(parsedHour) && parsedHour >= 0 && parsedHour <= 23
      ? parsedHour
      : 8;

  const minute =
    Number.isInteger(parsedMinute) && [0, 15, 30, 45].includes(parsedMinute)
      ? parsedMinute
      : 0;

  const formattedTime = `${String(hour).padStart(2, "0")}:${String(
    minute,
  ).padStart(2, "0")}`;

  const hourOptions = Array.from({ length: 24 }, (_, index) => index);
  const minuteOptions = [0, 15, 30, 45];

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function updateTime(nextHour: number, nextMinute: number) {
    const nextValue = `${String(nextHour).padStart(2, "0")}:${String(
      nextMinute,
    ).padStart(2, "0")}`;

    onChange(nextValue);
  }

  function getTimeLabel() {
    if (hour < 5) {
      return isEnglish ? "Early morning" : "Dini hari";
    }

    if (hour < 12) {
      return isEnglish ? "Morning" : "Pagi";
    }

    if (hour < 15) {
      return isEnglish ? "Afternoon" : "Siang";
    }

    if (hour < 18) {
      return isEnglish ? "Late afternoon" : "Sore";
    }

    return isEnglish ? "Evening" : "Malam";
  }

  function getTimeDescription() {
    if (hour < 5) {
      return isEnglish
        ? "A quiet moment for a gentle check-in."
        : "Waktu yang tenang untuk check-in.";
    }

    if (hour < 12) {
      return isEnglish
        ? "Start the day with a short check-in."
        : "Mulai hari dengan check-in singkat.";
    }

    if (hour < 15) {
      return isEnglish
        ? "Take a moment to check in with yourself."
        : "Luangkan sedikit waktu untuk mengecek keadaanmu.";
    }

    if (hour < 18) {
      return isEnglish
        ? "Pause and notice how your day is going."
        : "Berhenti sejenak dan lihat bagaimana harimu berjalan.";
    }

    return isEnglish
      ? "End the day by noticing how you feel."
      : "Tutup hari dengan memahami apa yang kamu rasakan.";
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return;
          }

          setOpen((current) => !current);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          isEnglish
            ? `Reminder time ${formattedTime}`
            : `Waktu pengingat ${formattedTime}`
        }
        className={`
          flex
          min-h-[68px]
          w-full
          items-center
          justify-between
          gap-4
          rounded-2xl
          border
          bg-white
          px-4
          text-left
          outline-none
          transition-all
          duration-200
          ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : open
                ? "border-[#E2725B]/45 bg-[#FFFDFC] shadow-[0_8px_30px_rgba(74,63,53,0.08)] ring-4 ring-[#FBC4AB]/20"
                : "border-[#4A3F35]/10 hover:border-[#C1D5C0] hover:bg-[#FFFEFC] focus:border-[#E2725B] focus:ring-4 focus:ring-[#FBC4AB]/25"
          }
        `}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBC4AB]/30 text-[#E2725B]">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5v4.8l3.2 1.9" />
            </svg>
          </span>

          <span className="min-w-0">
            <span className="block text-lg font-semibold tracking-[-0.02em] text-[#4A3F35]">
              {formattedTime}
            </span>

            <span className="mt-0.5 block text-xs text-[#4A3F35]/45">
              {getTimeLabel()} · {isEnglish ? "Every day" : "Setiap hari"}
            </span>
          </span>
        </div>

        <span
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#FDFBF7]
            text-[#4A3F35]/40
            transition-transform
            duration-200
            ${open ? "rotate-180 text-[#E2725B]" : ""}
          `}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && !disabled && (
        <div
          role="dialog"
          aria-label={
            isEnglish ? "Choose reminder time" : "Pilih waktu pengingat"
          }
          className="absolute left-0 right-0 z-[70] mt-2 overflow-hidden rounded-2xl border border-[#4A3F35]/[0.08] bg-white shadow-[0_20px_60px_rgba(74,63,53,0.14)]"
        >
          <div className="border-b border-[#4A3F35]/[0.06] px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#5C6B9C]">
                  {isEnglish ? "Reminder time" : "Waktu pengingat"}
                </p>

                <p className="mt-1 text-sm font-semibold leading-5 text-[#4A3F35]">
                  {getTimeDescription()}
                </p>
              </div>

              <span className="shrink-0 rounded-lg bg-[#FFF5F0] px-2.5 py-1 text-xs font-semibold text-[#E2725B]">
                {formattedTime}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 sm:p-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4A3F35]/40">
                  {isEnglish ? "Hour" : "Jam"}
                </p>

                <span className="text-[10px] text-[#4A3F35]/30">
                  24h
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {hourOptions.map((option) => {
                  const selected = option === hour;

                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateTime(option, minute)}
                      className={`
                        flex
                        h-9
                        items-center
                        justify-center
                        rounded-lg
                        text-xs
                        font-medium
                        transition
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#FBC4AB]/50
                        ${
                          selected
                            ? "bg-[#E2725B] text-white shadow-[0_4px_12px_rgba(226,114,91,0.18)]"
                            : "bg-[#FDFBF7] text-[#4A3F35]/65 hover:bg-[#FBC4AB]/20 hover:text-[#4A3F35]"
                        }
                      `}
                    >
                      {String(option).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4A3F35]/40">
                {isEnglish ? "Minute" : "Menit"}
              </p>

              <div className="grid grid-cols-2 gap-1.5">
                {minuteOptions.map((option) => {
                  const selected = option === minute;

                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateTime(hour, option)}
                      className={`
                        flex
                        h-9
                        items-center
                        justify-center
                        rounded-lg
                        text-xs
                        font-medium
                        transition
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#C1D5C0]/70
                        ${
                          selected
                            ? "bg-[#5C6B9C] text-white shadow-[0_4px_12px_rgba(92,107,156,0.16)]"
                            : "bg-[#FDFBF7] text-[#4A3F35]/65 hover:bg-[#C1D5C0]/30 hover:text-[#4A3F35]"
                        }
                      `}
                    >
                      {String(option).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#4A3F35]/[0.06] bg-[#FDFBF7]/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#4A3F35]">
                {getTimeLabel()}
              </p>

              <p className="mt-0.5 text-[10px] leading-4 text-[#4A3F35]/40">
                {isEnglish
                  ? "The reminder will be sent every day."
                  : "Pengingat akan dikirim setiap hari."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-xl bg-[#4A3F35] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#5C6B9C] focus:outline-none focus:ring-4 focus:ring-[#FBC4AB]/30"
            >
              {isEnglish ? "Done" : "Selesai"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===============================================================
   MOODIFY SELECT
================================================================ */

function ReweaveSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  disabled = false,
}: ReweaveSelectProps) {
  const [open, setOpen] = useState(false);

  const [highlightedIndex, setHighlightedIndex] =
    useState(0);

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const selectedIndex = options.findIndex(
    (option) => option.value === value
  );

  const selectedOption =
    selectedIndex >= 0
      ? options[selectedIndex]
      : undefined;

  /*
   * =========================================================
   * CLICK OUTSIDE
   * =========================================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(
      event: PointerEvent
    ) {
      const target = event.target as Node;

      if (
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, [open]);

  /*
   * =========================================================
   * KEYBOARD
   * =========================================================
   */

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>
  ) {
    if (disabled || options.length === 0) {
      return;
    }

    /*
     * ARROW DOWN / UP
     */

    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      /*
       * Kalau dropdown belum terbuka,
       * buka dan mulai dari selected option.
       */
      if (!open) {
        setHighlightedIndex(
          selectedIndex >= 0
            ? selectedIndex
            : 0
        );

        setOpen(true);

        return;
      }

      setHighlightedIndex((current) => {
        if (event.key === "ArrowDown") {
          return current >= options.length - 1
            ? 0
            : current + 1;
        }

        return current <= 0
          ? options.length - 1
          : current - 1;
      });

      return;
    }

    /*
     * ENTER / SPACE
     */

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      /*
       * Kalau belum terbuka,
       * buka dropdown dulu.
       */
      if (!open) {
        setHighlightedIndex(
          selectedIndex >= 0
            ? selectedIndex
            : 0
        );

        setOpen(true);

        return;
      }

      const option =
        options[highlightedIndex];

      if (option) {
        onChange(option.value);
        setOpen(false);
      }

      return;
    }

    /*
     * ESCAPE
     */

    if (event.key === "Escape") {
      event.preventDefault();

      setOpen(false);

      return;
    }
  }

  /*
   * =========================================================
   * SELECT OPTION
   * =========================================================
   */

  function handleSelect(value: string) {
    onChange(value);
    setOpen(false);
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* ===================================================
          TRIGGER
      ==================================================== */}

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled || options.length === 0) {
            return;
          }

          if (!open) {
            setHighlightedIndex(
              selectedIndex >= 0
                ? selectedIndex
                : 0
            );
          }

          setOpen((current) => !current);
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`
          flex
          min-h-[60px]
          w-full
          items-center
          justify-between
          gap-4
          rounded-2xl
          border
          bg-white
          px-4
          text-left
          outline-none
          transition-all
          duration-200
          ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : open
                ? "border-[#E2725B]/45 bg-[#FFFDFC] shadow-[0_8px_30px_rgba(74,63,53,0.08)] ring-4 ring-[#FBC4AB]/20"
                : "border-[#4A3F35]/10 hover:border-[#C1D5C0] hover:bg-[#FFFEFC] focus:border-[#E2725B] focus:ring-4 focus:ring-[#FBC4AB]/25"
          }
        `}
      >
        <div className="min-w-0 flex-1">
          <p
            className={`
              truncate
              text-sm
              font-semibold
              ${
                selectedOption
                  ? "text-[#4A3F35]"
                  : "text-[#4A3F35]/35"
              }
            `}
          >
            {selectedOption?.label ??
              placeholder}
          </p>

          {selectedOption?.description && (
            <p className="mt-1 truncate text-[11px] leading-4 text-[#4A3F35]/40">
              {selectedOption.description}
            </p>
          )}
        </div>

        {/* CHEVRON */}

        <span
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#FDFBF7]
            text-[#4A3F35]/40
            transition-all
            duration-200
            ${
              open
                ? "rotate-180 bg-[#FBC4AB]/20 text-[#E2725B]"
                : ""
            }
          `}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {/* ===================================================
          DROPDOWN
      ==================================================== */}

      {open && !disabled && (
        <div
          role="listbox"
          aria-label="Options"
          className="
            absolute
            left-0
            right-0
            z-[60]
            mt-2
            overflow-hidden
            rounded-2xl
            border
            border-[#4A3F35]/[0.08]
            bg-white
            p-1.5
            shadow-[0_18px_50px_rgba(74,63,53,0.12)]
          "
        >
          <div className="max-h-[300px] overflow-y-auto overscroll-contain">
            {options.map((option, index) => {
              const selected =
                option.value === value;

              const highlighted =
                index === highlightedIndex;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() =>
                    setHighlightedIndex(index)
                  }
                  onClick={() =>
                    handleSelect(option.value)
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-left
                    transition
                    ${
                      selected
                        ? "bg-[#FFF5F0]"
                        : highlighted
                          ? "bg-[#FDFBF7]"
                          : "bg-transparent"
                    }
                  `}
                >
                  {/* SELECTION */}

                  <span
                    className={`
                      flex
                      h-5
                      w-5
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      transition
                      ${
                        selected
                          ? "border-[#E2725B] bg-[#E2725B]"
                          : "border-[#4A3F35]/15 bg-white"
                      }
                    `}
                  >
                    {selected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>

                  {/* CONTENT */}

                  <span className="min-w-0 flex-1">
                    <span
                      className={`
                        block
                        truncate
                        text-sm
                        font-medium
                        ${
                          selected
                            ? "text-[#4A3F35]"
                            : "text-[#4A3F35]/75"
                        }
                      `}
                    >
                      {option.label}
                    </span>

                    {option.description && (
                      <span className="mt-0.5 block text-[10px] leading-4 text-[#4A3F35]/35">
                        {option.description}
                      </span>
                    )}
                  </span>

                  {/* SELECTED */}

                  {selected && (
                    <span className="shrink-0 text-[10px] font-semibold text-[#E2725B]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}