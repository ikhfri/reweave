"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Globe2,
  Heart,
  Save,
  User,
} from "lucide-react";

import type { Locale } from "@/i18n/config";

type SettingsData = {
  name: string;
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

export default function SettingsClient({
  locale,
  userName,
}: Props) {
  const router = useRouter();

  const isEnglish = locale === "en";

  const [settings, setSettings] =
    useState<SettingsData | null>(null);

  const [name, setName] = useState(userName);
  const [language, setLanguage] = useState<"ID" | "EN">(
    locale === "en" ? "EN" : "ID",
  );

  const [communicationStyle, setCommunicationStyle] =
    useState("BALANCED");

  const [supportPreference, setSupportPreference] =
    useState("UNDERSTAND");

  const [journalingPreference, setJournalingPreference] =
    useState("WRITING");

  const [notifications, setNotifications] = useState(true);

  const [dailyCheckinTime, setDailyCheckinTime] =
    useState("08:00");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
            result?.message ?? "Gagal mengambil pengaturan.",
          );
        }

        if (cancelled) return;

        const data: SettingsData = result.settings;

        setSettings(data);
        setName(data.name);
        setLanguage(data.preference.language);
        setCommunicationStyle(
          data.preference.communicationStyle,
        );
        setSupportPreference(
          data.preference.supportPreference,
        );
        setJournalingPreference(
          data.preference.journalingPreference,
        );
        setNotifications(
          data.preference.notificationEnabled,
        );
        setDailyCheckinTime(
          data.preference.dailyCheckinTime ?? "08:00",
        );
      } catch (error) {
        console.error("Settings load error:", error);
        setMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil pengaturan.",
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
  }, []);

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
          name,
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
          result?.message ?? "Gagal menyimpan pengaturan.",
        );
      }

      setSettings(result.settings);

     const nextLocale: Locale =
  language === "EN" ? "en" : "id";

      if (nextLocale !== locale) {
        router.replace(`/${nextLocale}/settings`);
        return;
      }

      router.refresh();

      setMessage(
        isEnglish
          ? "Preferences saved successfully."
          : "Preferensi berhasil disimpan.",
      );
    } catch (error) {
      console.error("Settings save error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : isEnglish
            ? "Failed to save preferences."
            : "Gagal menyimpan preferensi.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#C1D5C0]/45" />
        <div className="h-40 animate-pulse rounded-2xl bg-[#FDFBF7]" />
        <div className="h-56 animate-pulse rounded-2xl bg-[#FDFBF7]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 text-[#4A3F35]">
      {/* HEADER */}
      <section>
        <p className="text-sm font-medium text-[#5C6B9C]">
          {isEnglish ? "Settings" : "Pengaturan"}
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-[-0.035em] text-[#4A3F35]">
          {isEnglish
            ? "Your preferences"
            : "Preferensi kamu"}
        </h1>

        <p className="mt-2 text-sm text-[#4A3F35]/65">
          {isEnglish
            ? "Personalize how Moodify works for you."
            : "Personalisasikan bagaimana Moodify bekerja untukmu."}
        </p>
      </section>

      {/* PROFILE */}
      <section className="rounded-2xl border border-[#4A3F35]/10 bg-[#FDFBF7] ">
        <div className="border-b border-[#4A3F35]/8 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBC4AB]/40">
              <User className="h-5 w-5 text-[#5C6B9C]" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#4A3F35]">
                {isEnglish ? "Profile" : "Profil"}
              </h2>

              <p className="text-xs text-[#4A3F35]/50">
                {isEnglish
                  ? "Basic account information."
                  : "Informasi dasar akun."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-xs font-medium text-[#4A3F35]/80">
              {isEnglish ? "Name" : "Nama"}
            </label>

            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-[#4A3F35]/10 px-3 text-sm outline-none focus:border-[#E2725B] focus:ring-2 focus:ring-[#FBC4AB]/55"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-[#4A3F35]/80">
              Email
            </label>

            <input
              value={settings?.email ?? ""}
              disabled
              className="h-11 w-full rounded-xl border border-[#4A3F35]/10 bg-[#C1D5C0]/18 px-3 text-sm text-[#4A3F35]/50"
            />
          </div>
        </div>
      </section>

      {/* LANGUAGE */}
      <section className="rounded-2xl border border-[#4A3F35]/10 bg-[#FDFBF7] ">
        <div className="border-b border-[#4A3F35]/8 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBC4AB]/40">
              <Globe2 className="h-5 w-5 text-[#5C6B9C]" />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                {isEnglish ? "Language" : "Bahasa"}
              </h2>

              <p className="text-xs text-[#4A3F35]/50">
                {isEnglish
                  ? "Choose your preferred language."
                  : "Pilih bahasa yang kamu gunakan."}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <select
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value as "ID" | "EN")
            }
            className="h-11 w-full rounded-xl border border-[#4A3F35]/10 px-3 text-sm outline-none focus:border-[#E2725B] focus:ring-2 focus:ring-[#FBC4AB]/55"
          >
            <option value="ID">Bahasa Indonesia</option>
            <option value="EN">English</option>
          </select>
        </div>
      </section>

      {/* COMMUNICATION */}
      <section className="rounded-2xl border border-[#4A3F35]/10 bg-[#FDFBF7] ">
        <div className="border-b border-[#4A3F35]/8 p-6">
          <h2 className="text-sm font-semibold">
            {isEnglish
              ? "Communication style"
              : "Gaya komunikasi"}
          </h2>

          <p className="mt-1 text-xs text-[#4A3F35]/50">
            {isEnglish
              ? "How would you like Moodify to communicate with you?"
              : "Bagaimana kamu ingin Moodify berkomunikasi denganmu?"}
          </p>
        </div>

        <div className="p-6">
          <select
            value={communicationStyle}
            onChange={(event) =>
              setCommunicationStyle(event.target.value)
            }
            className="h-11 w-full rounded-xl border border-[#4A3F35]/10 px-3 text-sm outline-none focus:border-[#E2725B] focus:ring-2 focus:ring-[#FBC4AB]/55"
          >
            <option value="GENTLE">
              {isEnglish ? "Gentle" : "Lembut"}
            </option>

            <option value="PRACTICAL">
              {isEnglish ? "Practical" : "Praktis"}
            </option>

            <option value="BALANCED">
              {isEnglish ? "Balanced" : "Seimbang"}
            </option>
          </select>
        </div>
      </section>

      {/* SUPPORT */}
      <section className="rounded-2xl border border-[#4A3F35]/10 bg-[#FDFBF7] ">
        <div className="border-b border-[#4A3F35]/8 p-6">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-[#5C6B9C]" />

            <div>
              <h2 className="text-sm font-semibold">
                {isEnglish
                  ? "Support preference"
                  : "Preferensi dukungan"}
              </h2>

              <p className="mt-1 text-xs text-[#4A3F35]/50">
                {isEnglish
                  ? "What kind of support feels useful to you?"
                  : "Dukungan seperti apa yang terasa berguna untukmu?"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <select
            value={supportPreference}
            onChange={(event) =>
              setSupportPreference(event.target.value)
            }
            className="h-11 w-full rounded-xl border border-[#4A3F35]/10 px-3 text-sm outline-none focus:border-[#E2725B] focus:ring-2 focus:ring-[#FBC4AB]/55"
          >
            <option value="LISTEN">
              {isEnglish ? "Just listen" : "Cukup didengarkan"}
            </option>

            <option value="UNDERSTAND">
              {isEnglish
                ? "Help me understand"
                : "Bantu saya memahami"}
            </option>

            <option value="CALM_ACTIVITY">
              {isEnglish
                ? "Calming activities"
                : "Aktivitas menenangkan"}
            </option>

            <option value="REFLECTION">
              {isEnglish ? "Reflection" : "Refleksi"}
            </option>

            <option value="PRACTICAL_STEPS">
              {isEnglish
                ? "Practical steps"
                : "Langkah praktis"}
            </option>

            <option value="SPACE">
              {isEnglish ? "Give me space" : "Berikan saya ruang"}
            </option>
          </select>
        </div>
      </section>

      {/* JOURNALING */}
      <section className="rounded-2xl border border-[#4A3F35]/10 bg-[#FDFBF7] ">
        <div className="border-b border-[#4A3F35]/8 p-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-[#5C6B9C]" />

            <div>
              <h2 className="text-sm font-semibold">
                {isEnglish
                  ? "Journaling preference"
                  : "Preferensi journaling"}
              </h2>

              <p className="mt-1 text-xs text-[#4A3F35]/50">
                {isEnglish
                  ? "How do you prefer to reflect?"
                  : "Bagaimana kamu lebih suka melakukan refleksi?"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <select
            value={journalingPreference}
            onChange={(event) =>
              setJournalingPreference(event.target.value)
            }
            className="h-11 w-full rounded-xl border border-[#4A3F35]/10 px-3 text-sm outline-none focus:border-[#E2725B] focus:ring-2 focus:ring-[#FBC4AB]/55"
          >
            <option value="WRITING">
              {isEnglish ? "Writing" : "Menulis"}
            </option>

            <option value="TALKING">
              {isEnglish ? "Talking" : "Berbicara"}
            </option>

            <option value="TRACKING">
              {isEnglish ? "Tracking" : "Tracking"}
            </option>

            <option value="CALMING_ACTIVITIES">
              {isEnglish
                ? "Calming activities"
                : "Aktivitas menenangkan"}
            </option>

            <option value="EVERYTHING">
              {isEnglish ? "Everything" : "Semua"}
            </option>
          </select>
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section className="rounded-2xl border border-[#4A3F35]/10 bg-[#FDFBF7] ">
        <div className="border-b border-[#4A3F35]/8 p-6">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-[#5C6B9C]" />

            <div>
              <h2 className="text-sm font-semibold">
                {isEnglish ? "Daily reminders" : "Pengingat harian"}
              </h2>

              <p className="mt-1 text-xs text-[#4A3F35]/50">
                {isEnglish
                  ? "Choose whether Moodify should remind you to check in."
                  : "Atur apakah Moodify boleh mengingatkanmu untuk check-in."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#4A3F35]">
                {isEnglish
                  ? "Enable reminders"
                  : "Aktifkan pengingat"}
              </p>

              <p className="mt-1 text-xs text-[#4A3F35]/50">
                {isEnglish
                  ? "Daily check-in reminder"
                  : "Pengingat check-in harian"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setNotifications((current) => !current)
              }
              className={`relative h-6 w-11 rounded-full transition ${
                notifications
                  ? "bg-[#E2725B]"
                  : "bg-[#C1D5C0]/55"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-[#FDFBF7] transition ${
                  notifications ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {notifications && (
            <div>
              <label className="mb-2 block text-xs font-medium text-[#4A3F35]/80">
                {isEnglish
                  ? "Reminder time"
                  : "Waktu pengingat"}
              </label>

              <input
                type="time"
                value={dailyCheckinTime}
                onChange={(event) =>
                  setDailyCheckinTime(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-[#4A3F35]/10 px-3 text-sm outline-none focus:border-[#E2725B] focus:ring-2 focus:ring-[#FBC4AB]/55"
              />
            </div>
          )}
        </div>
      </section>

      {/* SAVE */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        {message && (
          <p
            className={`text-xs font-medium ${
              message.toLowerCase().includes("gagal") ||
              message.toLowerCase().includes("failed")
                ? "text-[#C95F4B]"
                : "text-[#5C6B9C]"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E2725B] px-5 text-sm font-semibold text-white  transition hover:bg-[#C95F4B] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />

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