"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  Heart,
  Home,
  LockKeyhole,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";

import BackButton from "@/components/dashboard/back-button";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  user: {
    name: string;
    email: string;
  };
  children: React.ReactNode;
};

export default function DashboardShell({
  locale,
  user,
  children,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isEnglish = locale === "en";

  const navigation = [
    {
      label: isEnglish ? "Home" : "Beranda",
      href: `/${locale}/dashboard`,
      icon: Home,
    },
    {
      label: "Check-in",
      href: `/${locale}/check-in`,
      icon: Heart,
    },
    {
      label: "Diary",
      href: `/${locale}/diary`,
      icon: BookOpen,
    },
    {
      label: isEnglish ? "Insights" : "Insight",
      href: `/${locale}/insights`,
      icon: BarChart3,
    },
    {
      label: isEnglish ? "Mood Calendar" : "Kalender Mood",
      href: `/${locale}/mood-calendar`,
      icon: CalendarDays,
    },
    {
      label: isEnglish ? "Activities" : "Aktivitas",
      href: `/${locale}/activities`,
      icon: Activity,
    },
    {
      label: isEnglish ? "Support" : "Dukungan",
      href: `/${locale}/support`,
      icon: ShieldCheck,
    },
  ];

  const mobileNavigation = [
    navigation[0],
    navigation[1],
    navigation[2],
    navigation[3],
    navigation[4],
  ];

  const secondaryNavigation = [
    {
      label: isEnglish ? "Settings" : "Pengaturan",
      href: `/${locale}/settings`,
      icon: Settings,
    },
      {
    label: isEnglish ? "Privacy" : "Privasi",
    href: `/${locale}/privacy`,
    icon: LockKeyhole,
  },
  ];

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push(`/${locale}/login`);
      router.refresh();
    }
  }

  function isActive(href: string) {
    if (href.endsWith("/dashboard")) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#4a3f35]">
      {/* =========================================================
          MOBILE OVERLAY
      ========================================================= */}

      {mobileOpen && (
        <button
          type="button"
          aria-label={
            isEnglish
              ? "Close menu"
              : "Tutup menu"
          }
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#4a3f35]/20 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* =========================================================
          DESKTOP SIDEBAR
      ========================================================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[246px] flex-col border-r border-[#e7ddd5] bg-[#fdfbf7] transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Brand */}

        <div className="flex h-[82px] items-center px-6">
          <Link
            href={`/${locale}/dashboard`}
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#e2725b] transition-transform duration-200 group-hover:rotate-[-4deg]">
              <Heart
                className="h-[17px] w-[17px] text-white"
                strokeWidth={1.9}
                fill="none"
              />

              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#c1d5c0]" />
            </div>

            <div>
              <span className="block text-[17px] font-bold tracking-[-0.03em] text-[#4a3f35]">
                Moodify
              </span>

              <span className="mt-0.5 block text-[9px] font-medium tracking-[0.12em] text-[#4a3f35]/40">
                YOUR INNER SPACE
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[#4a3f35]/45 transition hover:bg-[#c1d5c0]/30 hover:text-[#4a3f35] lg:hidden"
            aria-label={
              isEnglish
                ? "Close menu"
                : "Tutup menu"
            }
          >
            <X
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </button>
        </div>

        {/* Navigation */}

        <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-5">
          <div className="mb-3 px-2">
            <span className="text-[10px] font-semibold tracking-[0.08em] text-[#4a3f35]/35">
              {isEnglish
                ? "EXPLORE"
                : "JELAJAHI"}
            </span>
          </div>

          <nav className="space-y-0.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(
                item.href,
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={`group relative flex h-[43px] items-center gap-3 rounded-[11px] px-3 text-[13px] font-medium transition-all duration-200 ${
                    active
                      ? "bg-[#fbc4ab]/25 text-[#4a3f35]"
                      : "text-[#4a3f35]/58 hover:bg-[#c1d5c0]/15 hover:text-[#4a3f35]"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#e2725b]" />
                  )}

                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                      active
                        ? "bg-[#fbc4ab]/45"
                        : "bg-transparent group-hover:bg-[#c1d5c0]/20"
                    }`}
                  >
                    <Icon
                      className="h-[16px] w-[16px]"
                      strokeWidth={
                        active ? 2 : 1.7
                      }
                    />
                  </span>

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}

          <div className="my-6 h-px bg-[#c1d5c0]/35" />

          {/* Secondary navigation */}

          <div className="mb-3 px-2">
            <span className="text-[10px] font-semibold tracking-[0.08em] text-[#4a3f35]/35">
              {isEnglish
                ? "PERSONAL"
                : "PRIBADI"}
            </span>
          </div>

          <nav>
            {secondaryNavigation.map(
              (item) => {
                const Icon = item.icon;
                const active = isActive(
                  item.href,
                );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={`group relative flex h-[43px] items-center gap-3 rounded-[11px] px-3 text-[13px] font-medium transition-all duration-200 ${
                      active
                        ? "bg-[#fbc4ab]/25 text-[#4a3f35]"
                        : "text-[#4a3f35]/58 hover:bg-[#c1d5c0]/15 hover:text-[#4a3f35]"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#e2725b]" />
                    )}

                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                        active
                          ? "bg-[#fbc4ab]/45"
                          : "group-hover:bg-[#c1d5c0]/20"
                      }`}
                    >
                      <Icon
                        className="h-[16px] w-[16px]"
                        strokeWidth={
                          active ? 2 : 1.7
                        }
                      />
                    </span>

                    <span>
                      {item.label}
                    </span>
                  </Link>
                );
              },
            )}
          </nav>

          {/* Personal note */}

          <div className="mt-auto pt-8">
            <div className="relative overflow-hidden rounded-[15px] border border-[#fbc4ab]/45 bg-[#fbc4ab]/18 px-4 py-4">
              <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-[#c1d5c0]/30" />

              <div className="relative">
                <div className="mb-3 h-[2px] w-7 rounded-full bg-[#e2725b]" />

                <p className="text-[12px] font-semibold leading-5 text-[#4a3f35]">
                  {isEnglish
                    ? "Take it one day at a time."
                    : "Jalani hari ini, satu langkah."}
                </p>

                <p className="mt-1.5 text-[10px] leading-[1.6] text-[#4a3f35]/55">
                  {isEnglish
                    ? "There is no need to figure everything out today."
                    : "Kamu tidak harus memahami semuanya hari ini."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User area */}

        <div className="border-t border-[#e7ddd5] px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fbc4ab]/55 text-[11px] font-bold text-[#5c6b9c]">
              {getInitials(user.name)}

              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#fdfbf7] bg-[#c1d5c0]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-[#4a3f35]">
                {user.name}
              </p>

              <p className="mt-0.5 truncate text-[10px] text-[#4a3f35]/40">
                {user.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              aria-label={
                isEnglish
                  ? "Log out"
                  : "Keluar"
              }
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#4a3f35]/35 transition hover:bg-[#c1d5c0]/25 hover:text-[#4a3f35]"
            >
              <LogOut
                className="h-[15px] w-[15px]"
                strokeWidth={1.7}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================
          MAIN AREA
      ========================================================= */}

      <div className="lg:pl-[246px]">
        {/* ---------------------------------------------------------
            MOBILE HEADER
        --------------------------------------------------------- */}

        <header className="sticky top-0 z-30 flex h-[66px] items-center justify-between border-b border-[#e7ddd5] bg-[#fdfbf7]/95 px-5 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() =>
              setMobileOpen(true)
            }
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#4a3f35]/60 transition hover:bg-[#c1d5c0]/25 hover:text-[#4a3f35]"
            aria-label={
              isEnglish
                ? "Open menu"
                : "Buka menu"
            }
          >
            <Menu
              className="h-[19px] w-[19px]"
              strokeWidth={1.8}
            />
          </button>

          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#e2725b]">
              <Heart
                className="h-[14px] w-[14px] text-white"
                strokeWidth={1.9}
              />
            </div>

            <span className="text-[15px] font-bold tracking-[-0.02em] text-[#4a3f35]">
              Moodify
            </span>
          </Link>

          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#fbc4ab]/55 text-[10px] font-bold text-[#5c6b9c]">
            {getInitials(user.name)}

            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#fdfbf7] bg-[#c1d5c0]" />
          </div>
        </header>

        {/* ---------------------------------------------------------
            DESKTOP TOP BAR
        --------------------------------------------------------- */}

        <header className="hidden h-[76px] items-center justify-between border-b border-[#e7ddd5] bg-[#fdfbf7] px-8 lg:flex">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-[#4a3f35]/35">
              {isEnglish
                ? "YOUR SPACE"
                : "RUANGMU"}
            </p>

            <p className="mt-1 text-[13px] text-[#4a3f35]/55">
              {isEnglish
                ? "A place to check in with yourself."
                : "Tempat untuk kembali terhubung dengan dirimu."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[12px] font-semibold text-[#4a3f35]">
                {user.name}
              </p>

              <p className="mt-0.5 text-[10px] text-[#4a3f35]/40">
                {isEnglish
                  ? "Your wellbeing space"
                  : "Ruang wellbeing-mu"}
              </p>
            </div>

            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#fbc4ab]/55 text-[11px] font-bold text-[#5c6b9c]">
              {getInitials(user.name)}

              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#fdfbf7] bg-[#c1d5c0]" />
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------
            PAGE CONTENT
        --------------------------------------------------------- */}

        <main className="min-h-[calc(100vh-66px)] px-5 pb-28 pt-6 sm:px-8 sm:pt-8 lg:min-h-[calc(100vh-76px)] lg:px-10 lg:pb-12 lg:pt-9 xl:px-12">
          <div className="mx-auto w-full max-w-[1280px]">
            <BackButton locale={locale} />

            <div className="mt-3">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================
          MOBILE BOTTOM NAVIGATION
      ========================================================= */}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e7ddd5] bg-[#fdfbf7]/97 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {mobileNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(
              item.href,
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition ${
                  active
                    ? "text-[#5c6b9c]"
                    : "text-[#4a3f35]/40 hover:text-[#4a3f35]/70"
                }`}
              >
                {active && (
                  <span className="absolute -top-2 h-0.5 w-5 rounded-full bg-[#e2725b]" />
                )}

                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={
                    active ? 2 : 1.6
                  }
                />

                <span className="text-[9px] font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}