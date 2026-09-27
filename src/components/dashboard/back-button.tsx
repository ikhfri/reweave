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
      className="mb-6 inline-flex h-9 items-center gap-2 rounded-lg border border-[#4A3F35]/10 bg-[#FDFBF7] px-3 text-xs font-medium text-[#4A3F35]/75 transition hover:border-[#E2725B]/30 hover:bg-[#FBC4AB]/35 hover:text-[#E2725B] focus:outline-none focus:ring-2 focus:ring-[#FBC4AB]/55"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
      {isEnglish ? "Back" : "Kembali"}
    </button>
  );
}
