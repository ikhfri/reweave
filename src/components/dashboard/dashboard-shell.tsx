"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpen,
  Heart,
  Home,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
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

  const secondaryNavigation = [
    {
      label: isEnglish ? "Settings" : "Pengaturan",
      href: `/${locale}/settings`,
      icon: Settings,
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

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-[#f8f8fb]">
      {mobileOpen && (
        <button
          type="button"
          aria-label={isEnglish ? "Close menu" : "Tutup menu"}
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-gray-100 px-5">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <Heart className="h-4 w-4 text-white" strokeWidth={1.8} />
            </div>

            <span className="text-lg font-bold tracking-tight text-gray-900">
              Moodify
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="my-5 h-px bg-gray-100" />

          <nav className="space-y-1">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            <div className="rounded-2xl bg-indigo-50 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <Sparkles
                  className="h-4 w-4 text-indigo-600"
                  strokeWidth={1.8}
                />
              </div>

              <p className="mt-3 text-xs font-semibold text-gray-900">
                {isEnglish ? "Your wellbeing space" : "Ruang wellbeing-mu"}
              </p>

              <p className="mt-1 text-[11px] leading-5 text-gray-500">
                {isEnglish
                  ? "Moodify grows with your emotional journey."
                  : "Moodify berkembang bersama perjalanan emosionalmu."}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
              {getInitials(user.name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-900">
                {user.name}
              </p>
              <p className="truncate text-[10px] text-gray-400">
                {user.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              aria-label={isEnglish ? "Log out" : "Keluar"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-gray-200 bg-white/90 px-5 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label={isEnglish ? "Open menu" : "Buka menu"}
          >
            <Menu className="h-5 w-5" strokeWidth={1.8} />
          </button>

          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Heart className="h-4 w-4 text-white" strokeWidth={1.8} />
            </div>
            <span className="text-sm font-bold text-gray-900">Moodify</span>
          </Link>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
            {getInitials(user.name)}
          </div>
        </header>

        <header className="hidden h-[72px] items-center justify-end border-b border-gray-200 bg-white px-8 lg:flex">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-900">
                {user.name}
              </p>
              <p className="text-[10px] text-gray-400">
                Emotional wellbeing
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
              {getInitials(user.name)}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] px-5 py-7 pb-28 sm:px-8 sm:py-9 lg:min-h-[calc(100vh-72px)] lg:pb-12">
          <BackButton locale={locale} />
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[9px] font-medium ${
                  active ? "text-indigo-600" : "text-gray-400"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                <span>{item.label}</span>
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