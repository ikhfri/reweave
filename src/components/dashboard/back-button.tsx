"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import type { Locale } from "@/i18n/config";

export default function BackButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const isEnglish = locale === "en";
  const isDashboard = pathname === `/${locale}/dashboard`;

  if (isDashboard) return null;

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(`/${locale}/dashboard`);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-6 inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
      {isEnglish ? "Back" : "Kembali"}
    </button>
  );
}
