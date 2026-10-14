"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import BackButton from "@/components/dashboard/back-button";

import {
  ActivityIcon,
  CalendarMoodIcon,
  CheckinIcon,
  DiaryIcon,
  HomeIcon,
  InsightIcon,
  PrivacyIcon,
  SettingsIcon,
  SupportIcon,
  WellbeingIcon,
} from "@/components/reweave-icons";

import type { Locale } from "@/i18n/config";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  locale: Locale;

  user: {
    name: string;
    email: string;
  };

  children: React.ReactNode;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function DashboardShell({
  locale,
  user,
  children,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const isEnglish = locale === "en";

  /* ==========================================================
     PRIMARY NAVIGATION
  ========================================================== */

  const navigation: NavigationItem[] = [
    {
      label: isEnglish
        ? "Home"
        : "Beranda",
      href: `/${locale}/dashboard`,
      icon: HomeIcon,
    },

    {
      label: "Moodlog",
      href: `/${locale}/moodlog`,
      icon: CheckinIcon,
    },

    {
      label: "Diary",
      href: `/${locale}/diary`,
      icon: DiaryIcon,
    },

    {
      label: isEnglish
        ? "Emotions"
        : "Kenali Emosi",
      href: `/${locale}/emotions`,
      icon: WellbeingIcon,
    },

    {
      label: isEnglish
        ? "Insights"
        : "Insight",
      href: `/${locale}/insights`,
      icon: InsightIcon,
    },

    {
      label: isEnglish
        ? "Mood Calendar"
        : "Kalender Mood",
      href: `/${locale}/mood-calendar`,
      icon: CalendarMoodIcon,
    },

    {
      label: isEnglish
        ? "Activities"
        : "Aktivitas",
      href: `/${locale}/activities`,
      icon: ActivityIcon,
    },

    {
      label: isEnglish
        ? "Support"
        : "Dukungan",
      href: `/${locale}/support`,
      icon: SupportIcon,
    },
  ];

  /* ==========================================================
     MOBILE NAVIGATION

     Keep the most important destinations visible.
  ========================================================== */

  const mobileNavigation = [
    navigation[0], // Home
    navigation[1], // Check-in
    navigation[2], // Diary
    navigation[3], // Emotions
    navigation[4], // Insights
  ];

  /* ==========================================================
     SECONDARY NAVIGATION
  ========================================================== */

  const secondaryNavigation: NavigationItem[] = [
    {
      label: isEnglish
        ? "Settings"
        : "Pengaturan",
      href: `/${locale}/settings`,
      icon: SettingsIcon,
    },

    {
      label: isEnglish
        ? "Privacy"
        : "Privasi",
      href: `/${locale}/privacy`,
      icon: PrivacyIcon,
    },
  ];

  /* ==========================================================
     LOGOUT
  ========================================================== */

  async function handleLogout() {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        },
      );
    } finally {
      router.push(
        `/${locale}/login`,
      );

      router.refresh();
    }
  }

  /* ==========================================================
     ACTIVE STATE
  ========================================================== */

  function isActive(
    href: string,
  ) {
    if (
      href.endsWith("/dashboard")
    ) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`,
      )
    );
  }

  /* ==========================================================
     CLOSE MOBILE
  ========================================================== */

  function closeMobile() {
    setMobileOpen(false);
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3F35]">

      {/* ======================================================
          MOBILE OVERLAY
      ======================================================= */}

      {mobileOpen && (
        <button
          type="button"
          aria-label={
            isEnglish
              ? "Close menu"
              : "Tutup menu"
          }
          onClick={closeMobile}
          className="
            fixed
            inset-0
            z-40
            bg-[#4A3F35]/15
            backdrop-blur-[1px]
            lg:hidden
          "
        />
      )}

      {/* ======================================================
          SIDEBAR
      ======================================================= */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[246px]
          flex-col
          border-r
          border-[#E7DDD5]
          bg-[#FDFBF7]
          transition-transform
          duration-300
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* ==================================================
            BRAND
        =================================================== */}

        <div className="flex h-[82px] items-center px-6">
          <Link
            href={`/${locale}/dashboard`}
            onClick={closeMobile}
            className="group flex items-center"
            aria-label="Reweave Dashboard"
          >
            <Image
              src="/reweave-logo.webp"
              alt="Reweave"
              width={145}
              height={44}
              priority
              className="
                h-14
                w-auto
                object-contain
                transition-transform
                duration-200
                group-hover:-translate-y-0.5
              "
            />
          </Link>

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={closeMobile}
            className="
              ml-auto
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-[#4A3F35]/40
              transition
              hover:bg-[#C1D5C0]/25
              hover:text-[#4A3F35]
              lg:hidden
            "
            aria-label={
              isEnglish
                ? "Close menu"
                : "Tutup menu"
            }
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* ==================================================
            NAVIGATION AREA
        =================================================== */}

        <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-5">

          {/* PRIMARY LABEL */}

          <div className="mb-3 px-2">
            <span className="text-[10px] font-semibold tracking-[0.08em] text-[#4A3F35]/35">
              {isEnglish
                ? "EXPLORE"
                : "JELAJAHI"}
            </span>
          </div>

          {/* PRIMARY NAV */}

          <nav
            className="space-y-0.5"
            aria-label={
              isEnglish
                ? "Main navigation"
                : "Navigasi utama"
            }
          >
            {navigation.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  isActive(
                    item.href,
                  );

                return (
                  <NavigationLink
                    key={item.href}
                    item={item}
                    active={active}
                    onClick={
                      closeMobile
                    }
                  >
                    <Icon
                      className="
                        h-[20px]
                        w-[20px]
                      "
                    />
                  </NavigationLink>
                );
              },
            )}
          </nav>

          {/* ==================================================
              DIVIDER
          =================================================== */}

          <div className="my-6 h-px bg-[#C1D5C0]/35" />

          {/* ==================================================
              SECONDARY LABEL
          =================================================== */}

          <div className="mb-3 px-2">
            <span className="text-[10px] font-semibold tracking-[0.08em] text-[#4A3F35]/35">
              {isEnglish
                ? "PERSONAL"
                : "PRIBADI"}
            </span>
          </div>

          {/* SECONDARY NAV */}

          <nav
            aria-label={
              isEnglish
                ? "Personal navigation"
                : "Navigasi pribadi"
            }
          >
            {secondaryNavigation.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  isActive(
                    item.href,
                  );

                return (
                  <NavigationLink
                    key={item.href}
                    item={item}
                    active={active}
                    onClick={
                      closeMobile
                    }
                  >
                    <Icon
                      className="
                        h-[20px]
                        w-[20px]
                      "
                    />
                  </NavigationLink>
                );
              },
            )}
          </nav>

          {/* ==================================================
              PERSONAL NOTE
          =================================================== */}

          <div className="mt-auto pt-8">
            <div
              className="
                relative
                overflow-hidden
                rounded-[15px]
                border
                border-[#FBC4AB]/45
                bg-[#FBC4AB]/18
                px-4
                py-4
              "
            >
              {/* Organic decoration */}

              <div
                className="
                  absolute
                  -right-5
                  -top-5
                  h-16
                  w-16
                  rounded-full
                  bg-[#C1D5C0]/30
                "
              />

              <div className="relative">
                <div className="mb-3 h-[2px] w-7 rounded-full bg-[#E2725B]" />

                <p className="text-[12px] font-semibold leading-5 text-[#4A3F35]">
                  {isEnglish
                    ? "Take it one day at a time."
                    : "Jalani hari ini, satu langkah."}
                </p>

                <p className="mt-1.5 text-[10px] leading-[1.6] text-[#4A3F35]/55">
                  {isEnglish
                    ? "There is no need to figure everything out today."
                    : "Kamu tidak harus memahami semuanya hari ini."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            USER AREA
        =================================================== */}

        <div className="border-t border-[#E7DDD5] px-4 py-4">
          <div className="flex items-center gap-3">

            {/* Avatar */}

            <div
              className="
                relative
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#FBC4AB]/55
                text-[11px]
                font-bold
                text-[#5C6B9C]
              "
            >
              {getInitials(user.name)}

              <span
                className="
                  absolute
                  bottom-0
                  right-0
                  h-2.5
                  w-2.5
                  rounded-full
                  border-2
                  border-[#FDFBF7]
                  bg-[#C1D5C0]
                "
              />
            </div>

            {/* User information */}

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-[#4A3F35]">
                {user.name}
              </p>

              <p className="mt-0.5 truncate text-[10px] text-[#4A3F35]/40">
                {user.email}
              </p>
            </div>

            {/* Logout */}

            <button
              type="button"
              onClick={handleLogout}
              aria-label={
                isEnglish
                  ? "Log out"
                  : "Keluar"
              }
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                text-[#4A3F35]/35
                transition
                hover:bg-[#C1D5C0]/25
                hover:text-[#4A3F35]
              "
            >
              <LogoutIcon className="h-[16px] w-[16px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================
          MAIN AREA
      ======================================================= */}

      <div className="lg:pl-[246px]">

        {/* ====================================================
            MOBILE HEADER
        ===================================================== */}

        <header
          className="
            sticky
            top-0
            z-30
            flex
            h-[66px]
            items-center
            justify-between
            border-b
            border-[#E7DDD5]
            bg-[#FDFBF7]/95
            px-5
            backdrop-blur-md
            lg:hidden
          "
        >

          {/* MENU */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(true)
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-[10px]
              text-[#4A3F35]/60
              transition
              hover:bg-[#C1D5C0]/25
              hover:text-[#4A3F35]
            "
            aria-label={
              isEnglish
                ? "Open menu"
                : "Buka menu"
            }
          >
            <MenuIcon className="h-[19px] w-[19px]" />
          </button>

          {/* MOBILE LOGO */}

          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center"
            aria-label="Reweave Dashboard"
          >
            <Image
              src="/reweave-logo.webp"
              alt="Reweave"
              width={120}
              height={38}
              priority
              className="h-8 w-auto object-contain"
            />
          </Link>

          {/* MOBILE AVATAR */}

          <div
            className="
              relative
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-[#FBC4AB]/55
              text-[10px]
              font-bold
              text-[#5C6B9C]
            "
          >
            {getInitials(user.name)}

            <span
              className="
                absolute
                bottom-0
                right-0
                h-2.5
                w-2.5
                rounded-full
                border-2
                border-[#FDFBF7]
                bg-[#C1D5C0]
              "
            />
          </div>
        </header>

        {/* ====================================================
            DESKTOP TOP BAR
        ===================================================== */}

        <header
          className="
            hidden
            h-[76px]
            items-center
            justify-between
            border-b
            border-[#E7DDD5]
            bg-[#FDFBF7]
            px-8
            lg:flex
          "
        >

          {/* Left */}

          <div>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-[#4A3F35]/35">
              {isEnglish
                ? "YOUR SPACE"
                : "RUANGMU"}
            </p>

            <p className="mt-1 text-[13px] text-[#4A3F35]/55">
              {isEnglish
                ? "A place to check in with yourself."
                : "Tempat untuk kembali terhubung dengan dirimu."}
            </p>
          </div>

          {/* Right */}

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[12px] font-semibold text-[#4A3F35]">
                {user.name}
              </p>

              <p className="mt-0.5 text-[10px] text-[#4A3F35]/40">
                {isEnglish
                  ? "Your wellbeing space"
                  : "Ruang wellbeing-mu"}
              </p>
            </div>

            <div
              className="
                relative
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-[#FBC4AB]/55
                text-[11px]
                font-bold
                text-[#5C6B9C]
              "
            >
              {getInitials(user.name)}

              <span
                className="
                  absolute
                  bottom-0
                  right-0
                  h-2.5
                  w-2.5
                  rounded-full
                  border-2
                  border-[#FDFBF7]
                  bg-[#C1D5C0]
                "
              />
            </div>
          </div>
        </header>

        {/* ====================================================
            PAGE CONTENT
        ===================================================== */}

        <main
          className="
            min-h-[calc(100vh-66px)]
            px-5
            pb-28
            pt-6
            sm:px-8
            sm:pt-8
            lg:min-h-[calc(100vh-76px)]
            lg:px-10
            lg:pb-12
            lg:pt-9
            xl:px-12
          "
        >
          <div className="mx-auto w-full max-w-[1280px]">

            {/* GLOBAL BACK */}

            <BackButton locale={locale} />

            <div className="mt-3">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* ======================================================
          MOBILE BOTTOM NAVIGATION
      ======================================================= */}

      <nav
        className="
          fixed
          inset-x-0
          bottom-0
          z-30
          border-t
          border-[#E7DDD5]
          bg-[#FDFBF7]/97
          px-3
          pb-[max(8px,env(safe-area-inset-bottom))]
          pt-2
          backdrop-blur-md
          lg:hidden
        "
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {mobileNavigation.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                isActive(
                  item.href,
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className={`
                    relative
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-1
                    rounded-xl
                    py-1.5
                    transition
                    ${
                      active
                        ? "text-[#5C6B9C]"
                        : "text-[#4A3F35]/40 hover:text-[#4A3F35]/70"
                    }
                  `}
                >
                  {/* Active indicator */}

                  {active && (
                    <span
                      className="
                        absolute
                        -top-2
                        h-0.5
                        w-5
                        rounded-full
                        bg-[#E2725B]
                      "
                    />
                  )}

                  <Icon
                    className="h-[18px] w-[18px]"
                  />

                  <span className="text-[9px] font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            },
          )}
        </div>
      </nav>
    </div>
  );
}

/* ============================================================
   NAVIGATION LINK
============================================================ */

function NavigationLink({
  item,
  active,
  onClick,
  children,
}: {
  item: NavigationItem;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group
        relative
        flex
        h-[43px]
        items-center
        gap-3
        rounded-[11px]
        px-3
        text-[13px]
        font-medium
        transition-all
        duration-200
        ${
          active
            ? "bg-[#FBC4AB]/25 text-[#4A3F35]"
            : "text-[#4A3F35]/58 hover:bg-[#C1D5C0]/15 hover:text-[#4A3F35]"
        }
      `}
    >
      {/* Active line */}

      {active && (
        <span
          className="
            absolute
            left-0
            top-1/2
            h-5
            w-[3px]
            -translate-y-1/2
            rounded-r-full
            bg-[#E2725B]
          "
        />
      )}

      {/* Icon container */}

      <span
        className={`
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          transition
          ${
            active
              ? "bg-[#FBC4AB]/45"
              : "bg-transparent group-hover:bg-[#C1D5C0]/20"
          }
        `}
      >
        {children}
      </span>

      {/* Label */}

      <span>{item.label}</span>
    </Link>
  );
}

/* ============================================================
   INITIALS
============================================================ */

function getInitials(
  name: string,
) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (word) => word[0],
    )
    .join("")
    .toUpperCase();
}

/* ============================================================
   MENU ICON
============================================================ */

function MenuIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 15h28"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      <path
        d="M10 24h20"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      <path
        d="M10 33h28"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================================================
   CLOSE ICON
============================================================ */

function CloseIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="m15 15 18 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      <path
        d="m33 15-18 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================================================
   LOGOUT ICON
============================================================ */

function LogoutIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 10H13.5C12.1 10 11 11.1 11 12.5v23c0 1.4 1.1 2.5 2.5 2.5H20"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />

      <path
        d="M27 16l8 8-8 8"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M19 24h16"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}