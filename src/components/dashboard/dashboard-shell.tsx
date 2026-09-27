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
    <div className="min-h-screen bg-[#fdfbf7]">
      {mobileOpen && (
        <button
          type="button"
          aria-label={isEnglish ? "Close menu" : "Tutup menu"}
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#4a3f35]/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-[#e7ddd5] bg-[#fdfbf7] transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-[#eee6df] px-5">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e2725b]">
              <Heart className="h-4 w-4 text-white" strokeWidth={1.8} />
            </div>

            <span className="text-lg font-bold tracking-tight text-[#4a3f35]">
              Moodify
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4a3f35]/45 hover:bg-[#c1d5c0]/45 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4a3f35]/45">
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
                      ? "bg-[#fbc4ab]/35 text-[#5c6b9c]"
                      : "text-[#4a3f35]/65 hover:bg-[#fdfbf7] hover:text-[#4a3f35]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="my-5 h-px bg-[#c1d5c0]/45" />

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
                      ? "bg-[#fbc4ab]/35 text-[#5c6b9c]"
                      : "text-[#4a3f35]/65 hover:bg-[#fdfbf7] hover:text-[#4a3f35]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            <div className="rounded-2xl bg-[#fbc4ab]/35 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fdfbf7]">
                <Sparkles
                  className="h-4 w-4 text-[#5c6b9c]"
                  strokeWidth={1.8}
                />
              </div>

              <p className="mt-3 text-xs font-semibold text-[#4a3f35]">
                {isEnglish ? "Your wellbeing space" : "Ruang wellbeing-mu"}
              </p>

              <p className="mt-1 text-[11px] leading-5 text-[#4a3f35]/65">
                {isEnglish
                  ? "Moodify grows with your emotional journey."
                  : "Moodify berkembang bersama perjalanan emosionalmu."}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#eee6df] p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fbc4ab]/55 text-xs font-bold text-[#5c6b9c]">
              {getInitials(user.name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#4a3f35]">
                {user.name}
              </p>
              <p className="truncate text-[10px] text-[#4a3f35]/45">
                {user.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              aria-label={isEnglish ? "Log out" : "Keluar"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#4a3f35]/45 transition hover:bg-[#c1d5c0]/45 hover:text-[#4a3f35]"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-[#e7ddd5] bg-[#fdfbf7]/90 px-5 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#4a3f35]/65 hover:bg-[#c1d5c0]/45"
            aria-label={isEnglish ? "Open menu" : "Buka menu"}
          >
            <Menu className="h-5 w-5" strokeWidth={1.8} />
          </button>

          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e2725b]">
              <Heart className="h-4 w-4 text-white" strokeWidth={1.8} />
            </div>
            <span className="text-sm font-bold text-[#4a3f35]">Moodify</span>
          </Link>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fbc4ab]/55 text-[10px] font-bold text-[#5c6b9c]">
            {getInitials(user.name)}
          </div>
        </header>

        <header className="hidden h-[72px] items-center justify-end border-b border-[#e7ddd5] bg-[#fdfbf7] px-8 lg:flex">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-[#4a3f35]">
                {user.name}
              </p>
              <p className="text-[10px] text-[#4a3f35]/45">
                Emotional wellbeing
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fbc4ab]/55 text-xs font-bold text-[#5c6b9c]">
              {getInitials(user.name)}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] px-5 py-7 pb-28 sm:px-8 sm:py-9 lg:min-h-[calc(100vh-72px)] lg:pb-12">
          <BackButton locale={locale} />
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e7ddd5] bg-[#fdfbf7]/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[9px] font-medium ${
                  active ? "text-[#5c6b9c]" : "text-[#4a3f35]/45"
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