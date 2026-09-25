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
      aria-label={`Switch language to ${isEnglish ? "Indonesian" : "English"}`}
      className="
        group flex items-center gap-2
        rounded-full border border-gray-200
        bg-white p-1
        shadow-sm
        transition-all duration-200
        hover:border-indigo-200
        hover:shadow-md
      "
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors group-hover:text-indigo-600">
        <Languages className="h-4 w-4" />
      </div>

      <div className="relative flex h-8 w-[72px] items-center rounded-full bg-gray-100 p-1">
        {/* Sliding indicator */}
        <div
          className={`
            absolute top-1 h-6 w-8 rounded-full
            bg-indigo-600 shadow-sm
            transition-transform duration-200 ease-out
            ${isEnglish ? "translate-x-8" : "translate-x-0"}
          `}
        />

        <span
          className={`
            relative z-10 flex h-6 w-8 items-center justify-center
            text-[11px] font-bold transition-colors
            ${!isEnglish ? "text-white" : "text-gray-500"}
          `}
        >
          ID
        </span>

        <span
          className={`
            relative z-10 flex h-6 w-8 items-center justify-center
            text-[11px] font-bold transition-colors
            ${isEnglish ? "text-white" : "text-gray-500"}
          `}
        >
          EN
        </span>
      </div>
    </button>
  );
}