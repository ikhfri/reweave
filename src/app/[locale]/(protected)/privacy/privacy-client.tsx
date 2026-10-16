"use client";

import {
  AlertTriangle,
  Check,
  Download,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  userName: string;
};

export default function PrivacyClient({
  locale,
  userName,
}: Props) {
  const router = useRouter();

  const isEnglish = locale === "en";

  const [isDownloading, setIsDownloading] =
    useState(false);

  const [isDeletingDiary, setIsDeletingDiary] =
    useState(false);

  const [isDeletingAccount, setIsDeletingAccount] =
    useState(false);

  const [error, setError] = useState("");

  async function handleDownload() {
  try {
    setIsDownloading(true);
    setError("");

    const response = await fetch("/api/privacy/export");

    if (!response.ok) {
      throw new Error("Failed to export data.");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Reweave_Data_Export.pdf";

    document.body.appendChild(anchor);
    anchor.click();

    anchor.remove();
    window.URL.revokeObjectURL(url);
  } catch {
    setError(
      isEnglish
        ? "Failed to download your data."
        : "Gagal mengunduh data kamu.",
    );
  } finally {
    setIsDownloading(false);
  }
}

  async function handleDeleteDiary() {
    const firstConfirm =
      window.confirm(
        isEnglish
          ? "This will permanently delete all of your diary entries. Continue?"
          : "Ini akan menghapus seluruh diary kamu secara permanen. Lanjutkan?",
      );

    if (!firstConfirm) {
      return;
    }

    const secondConfirm =
      window.confirm(
        isEnglish
          ? "This action cannot be undone. Are you absolutely sure?"
          : "Tindakan ini tidak dapat dibatalkan. Kamu benar-benar yakin?",
      );

    if (!secondConfirm) {
      return;
    }

    setIsDeletingDiary(true);

    try {
      const response = await fetch(
        "/api/privacy/diary",
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete diary.",
        );
      }

      window.alert(
        isEnglish
          ? "Your diary has been deleted."
          : "Diary kamu berhasil dihapus.",
      );
    } catch (error) {
      console.error(
        "[Privacy] Diary deletion failed:",
        error,
      );

      window.alert(
        isEnglish
          ? "We couldn't delete your diary right now."
          : "Diary kamu belum bisa dihapus sekarang.",
      );
    } finally {
      setIsDeletingDiary(false);
    }
  }

  async function handleDeleteAccount() {
    const firstConfirm =
      window.confirm(
        isEnglish
          ? "This will permanently delete your Reweave account and associated data. Continue?"
          : "Ini akan menghapus akun Reweave dan data terkait secara permanen. Lanjutkan?",
      );

    if (!firstConfirm) {
      return;
    }

    const secondConfirm =
      window.confirm(
        isEnglish
          ? "This action cannot be undone. Are you absolutely sure?"
          : "Tindakan ini tidak dapat dibatalkan. Kamu benar-benar yakin?",
      );

    if (!secondConfirm) {
      return;
    }

    setIsDeletingAccount(true);

    try {
      const response =
        await fetch(
          "/api/privacy/account",
          {
            method: "DELETE",
          },
        );

      if (!response.ok) {
        throw new Error(
          "Failed to delete account.",
        );
      }

      router.push(`/${locale}/login`);
      router.refresh();
    } catch (error) {
      console.error(
        "[Privacy] Account deletion failed:",
        error,
      );

      window.alert(
        isEnglish
          ? "We couldn't delete your account right now."
          : "Akun kamu belum bisa dihapus sekarang.",
      );

      setIsDeletingAccount(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}

      <header className="mb-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#5c6b9c]/10">
          <LockKeyhole
            className="h-5 w-5 text-[#5c6b9c]"
            strokeWidth={1.8}
          />
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5c6b9c]">
          {isEnglish
            ? "Privacy Center"
            : "Pusat Privasi"}
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#4a3f35]">
          {isEnglish
            ? "Your privacy, your control."
            : "Privasimu, kendalimu."}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4a3f35]/55">
          {isEnglish
            ? `Reweave keeps your personal wellbeing space private, ${userName}. Here you can understand and manage the data connected to your account.`
            : `Reweave menjaga ruang wellbeing pribadimu tetap private, ${userName}. Di sini kamu bisa memahami dan mengatur data yang terhubung dengan akunmu.`}
        </p>
      </header>

      {error ? (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#e2725b]/20 bg-[#e2725b]/8 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#e2725b]" />
          <p className="text-xs leading-5 text-[#4a3f35]/70">
            {error}
          </p>
        </div>
      ) : null}

      <div className="space-y-5">
        {/* YOUR DATA */}

        <section className="rounded-[20px] border border-[#e7ddd5] bg-[#fdfbf7] p-6 md:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c1d5c0]/30">
              <ShieldCheck
                className="h-4.5 w-4.5 text-[#5c6b9c]"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#4a3f35]">
                {isEnglish
                  ? "Your data"
                  : "Data kamu"}
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#4a3f35]/45">
                {isEnglish
                  ? "A few things to know about how your Reweave data is handled."
                  : "Beberapa hal yang perlu kamu tahu tentang data di Reweave."}
              </p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-[#e7ddd5]">
            <PrivacyPoint
              icon={
                <FileText className="h-4 w-4" />
              }
              title={
                isEnglish
                  ? "Your diary is private"
                  : "Diary kamu bersifat private"
              }
              description={
                isEnglish
                  ? "Your diary entries are connected to your account and are not displayed publicly."
                  : "Catatan diary terhubung ke akunmu dan tidak ditampilkan secara publik."
              }
            />

            <PrivacyPoint
              icon={
                <UserRound className="h-4 w-4" />
              }
              title={
                isEnglish
                  ? "Your data belongs to your account"
                  : "Data kamu terhubung ke akunmu"
              }
              description={
                isEnglish
                  ? "Your check-ins, diary entries, and wellbeing information are associated with your account."
                  : "Check-in, diary, dan informasi wellbeing kamu tersimpan sebagai bagian dari akunmu."
              }
            />

            <PrivacyPoint
              icon={
                <ShieldCheck className="h-4 w-4" />
              }
              title={
                isEnglish
                  ? "AI analysis uses your submitted content"
                  : "Analisis AI menggunakan konten yang kamu kirim"
              }
              description={
                isEnglish
                  ? "AI analysis is generated from the information you choose to submit to Reweave."
                  : "Analisis AI dibuat berdasarkan informasi yang kamu pilih untuk dikirim ke Reweave."
              }
            />
          </div>
        </section>

        {/* AI & PRIVACY */}

        <section className="rounded-[20px] border border-[#e7ddd5] bg-[#fdfbf7] p-6 md:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fbc4ab]/25">
              <LockKeyhole
                className="h-4.5 w-4.5 text-[#e2725b]"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#4a3f35]">
                {isEnglish
                  ? "AI & privacy"
                  : "AI & privasi"}
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#4a3f35]/45">
                {isEnglish
                  ? "Reweave only analyzes content that you submit for an AI-powered feature."
                  : "Reweave hanya menganalisis konten yang kamu kirim untuk fitur yang menggunakan AI."}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-[#fbc4ab]/10 p-4">
            <p className="text-xs leading-6 text-[#4a3f35]/65">
              {isEnglish
                ? "AI-generated insights are intended to help you reflect on your wellbeing. They are not a medical diagnosis or a replacement for professional care."
                : "Insight yang dibuat AI ditujukan untuk membantu kamu melakukan refleksi terhadap wellbeing. Hasilnya bukan diagnosis medis dan bukan pengganti bantuan profesional."}
            </p>
          </div>
        </section>

        {/* DATA CONTROLS */}

        <section className="rounded-[20px] border border-[#e7ddd5] bg-[#fdfbf7] p-6 md:p-7">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-[#4a3f35]">
              {isEnglish
                ? "Data controls"
                : "Kontrol data"}
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#4a3f35]/45">
              {isEnglish
                ? "Choose what you want to do with the data connected to your account."
                : "Pilih tindakan yang ingin kamu lakukan terhadap data yang terhubung dengan akunmu."}
            </p>
          </div>

          <div className="space-y-3">
            {/* DOWNLOAD */}

            <DataAction
              icon={
                <Download className="h-4.5 w-4.5" />
              }
              title={
                isEnglish
                  ? "Download my data"
                  : "Download data saya"
              }
              description={
                isEnglish
                  ? "Get a copy of the personal data associated with your account."
                  : "Dapatkan salinan data pribadi yang terhubung dengan akunmu."
              }
              buttonLabel={
                isDownloading
                  ? isEnglish
                    ? "Preparing..."
                    : "Menyiapkan..."
                  : isEnglish
                    ? "Download"
                    : "Download"
              }
              onClick={handleDownload}
              disabled={isDownloading}
            />

            {/* DELETE DIARY */}

            <DataAction
              danger
              icon={
                <Trash2 className="h-4.5 w-4.5" />
              }
              title={
                isEnglish
                  ? "Delete my diary"
                  : "Hapus diary saya"
              }
              description={
                isEnglish
                  ? "Permanently remove your diary entries."
                  : "Hapus seluruh catatan diary secara permanen."
              }
              buttonLabel={
                isDeletingDiary
                  ? isEnglish
                    ? "Deleting..."
                    : "Menghapus..."
                  : isEnglish
                    ? "Delete diary"
                    : "Hapus diary"
              }
              onClick={
                handleDeleteDiary
              }
              disabled={isDeletingDiary}
            />

            {/* DELETE ACCOUNT */}

            <DataAction
              danger
              icon={
                <AlertTriangle className="h-4.5 w-4.5" />
              }
              title={
                isEnglish
                  ? "Delete my account"
                  : "Hapus akun saya"
              }
              description={
                isEnglish
                  ? "Permanently delete your account and associated data."
                  : "Hapus akun dan data yang terkait secara permanen."
              }
              buttonLabel={
                isDeletingAccount
                  ? isEnglish
                    ? "Deleting..."
                    : "Menghapus..."
                  : isEnglish
                    ? "Delete account"
                    : "Hapus akun"
              }
              onClick={
                handleDeleteAccount
              }
              disabled={
                isDeletingAccount
              }
            />
          </div>
        </section>

        {/* FOOTNOTE */}

        <div className="px-1 pb-8">
          <p className="text-[11px] leading-5 text-[#4a3f35]/35">
            {isEnglish
              ? "Before deleting data, make sure you have downloaded anything you may want to keep."
              : "Sebelum menghapus data, pastikan kamu sudah mengunduh data yang mungkin masih ingin kamu simpan."}
          </p>
        </div>
      </div>
    </div>
  );
}

function PrivacyPoint({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 py-5 first:pt-0 last:pb-0">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#c1d5c0]/25 text-[#5c6b9c]">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Check
            className="h-3.5 w-3.5 text-[#5c6b9c]"
            strokeWidth={2.2}
          />

          <h3 className="text-sm font-semibold text-[#4a3f35]">
            {title}
          </h3>
        </div>

        <p className="mt-1.5 text-xs leading-5 text-[#4a3f35]/50">
          {description}
        </p>
      </div>
    </div>
  );
}

function DataAction({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
  disabled,
  danger = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#e7ddd5] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            danger
              ? "bg-[#e2725b]/10 text-[#e2725b]"
              : "bg-[#5c6b9c]/10 text-[#5c6b9c]"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[#4a3f35]">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#4a3f35]/45">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          danger
            ? "border border-[#e2725b]/25 text-[#e2725b] hover:bg-[#e2725b]/8"
            : "bg-[#5c6b9c] text-white hover:bg-[#4f5e8c]"
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}