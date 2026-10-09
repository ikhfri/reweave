"use client";

import { Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
};

export function LanguageSwitcher({ locale }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function changeLanguage(nextLocale: Locale) {
    if (nextLocale === locale) return;

    const segments = pathname.split("/");

    // Ganti segment locale
    segments[1] = nextLocale;

    router.push(segments.join("/"));
  }

  const isEnglish = locale === "en";

  return (
    <button
      type="button"
      onClick={() => changeLanguage(isEnglish ? "id" : "en")}
      aria-label={`Switch language to ${
        isEnglish ? "Indonesian" : "English"
      }`}
      className="
        group flex items-center gap-2
        rounded-full border border-[#4a3f35]/15
        bg-[#fdfbf7] p-1
        shadow-sm
        transition-all duration-200
        hover:border-[#e2725b]/40
        hover:shadow-md
      "
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full text-[#4a3f35]/60 transition-colors group-hover:text-[#e2725b]">
        <Languages className="h-4 w-4" />
      </div>

      <div className="relative flex h-8 w-18 items-center rounded-full bg-[#c1d5c0]/45 p-1">
        {/* Sliding indicator */}
        <div
          className={`
            absolute top-1 h-6 w-8 rounded-full
            bg-[#e2725b] shadow-sm
            transition-transform duration-200 ease-out
            ${isEnglish ? "translate-x-8" : "translate-x-0"}
          `}
        />

        <span
          className={`
            relative z-10 flex h-6 w-8 items-center justify-center
            text-[11px] font-bold transition-colors
            ${!isEnglish ? "text-[#fdfbf7]" : "text-[#4a3f35]/60"}
          `}
        >
          ID
        </span>

        <span
          className={`
            relative z-10 flex h-6 w-8 items-center justify-center
            text-[11px] font-bold transition-colors
            ${isEnglish ? "text-[#fdfbf7]" : "text-[#4a3f35]/60"}
          `}
        >
          EN
        </span>
      </div>
    </button>
  );
}
